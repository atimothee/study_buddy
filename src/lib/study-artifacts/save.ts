import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudyArtifacts } from "@/lib/study-artifacts/schemas";
import type { CardType } from "@/lib/types";
import { captureAppError, withAppSpan } from "@/lib/sentry";

function normalizeFlashcardForSave(card: StudyArtifacts["flashcards"][number]) {
  let cardType = (card.card_type ?? "basic") as CardType;
  let clozeText = card.cloze_text ?? null;

  if (
    cardType === "cloze" &&
    (!clozeText || !clozeText.includes("{{") || !clozeText.includes("}}"))
  ) {
    if (card.answer && card.front.includes("____")) {
      clozeText = card.front.replace("_____", `{{${card.answer}}}`);
    } else if (card.answer) {
      clozeText = card.back.includes(card.answer)
        ? card.back.replace(card.answer, `{{${card.answer}}}`)
        : `{{${card.answer}}}`;
    } else {
      cardType = "basic";
      clozeText = null;
    }
  }

  return {
    card_type: cardType,
    front: card.front,
    back: card.back,
    cloze_text: clozeText,
    answer: card.answer ?? null,
    explanation: card.explanation ?? null,
    tags: card.tags ?? null,
    source_quote: card.source_quote ?? null,
    difficulty: card.difficulty,
  };
}

export interface SaveStudyArtifactsResult {
  success: true;
  summarySaved: boolean;
  flashcardCount: number;
  quizQuestionCount: number;
}

export async function verifyStudySetOwnership(
  supabase: SupabaseClient,
  studySetId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: studySet } = await supabase
    .from("study_sets")
    .select("id")
    .eq("id", studySetId)
    .eq("user_id", userId)
    .single();

  if (!studySet) {
    return { ok: false, error: "Study set not found" };
  }

  return { ok: true };
}

export async function saveStudyArtifactsToDb(
  supabase: SupabaseClient,
  studySetId: string,
  artifacts: StudyArtifacts
): Promise<SaveStudyArtifactsResult> {
  try {
    return await withAppSpan(
      "saveStudyArtifacts",
      "db.query",
      {
        feature: "study_generation",
        studySetId,
        flashcardCount: artifacts.flashcards.length,
        quizQuestionCount: artifacts.quiz.questions.length,
      },
      async () => {
        await supabase
          .from("study_sets")
          .update({
            summary: artifacts.summary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", studySetId);

        await supabase
          .from("flashcards")
          .delete()
          .eq("study_set_id", studySetId);

        if (artifacts.flashcards.length > 0) {
          await withAppSpan(
            "saveStudyArtifacts.flashcards",
            "db.query",
            {
              feature: "flashcards",
              studySetId,
              flashcardCount: artifacts.flashcards.length,
            },
            () =>
              supabase.from("flashcards").insert(
                artifacts.flashcards.map((card) => ({
                  study_set_id: studySetId,
                  ...normalizeFlashcardForSave(card),
                }))
              )
          );
        }

        const { data: existingQuiz } = await supabase
          .from("quizzes")
          .select("id")
          .eq("study_set_id", studySetId)
          .maybeSingle();

        let quizId = existingQuiz?.id;

        if (quizId) {
          await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
          await supabase
            .from("quizzes")
            .update({ title: artifacts.quiz.title })
            .eq("id", quizId);
        } else {
          const { data: newQuiz } = await supabase
            .from("quizzes")
            .insert({
              study_set_id: studySetId,
              title: artifacts.quiz.title,
            })
            .select("id")
            .single();
          quizId = newQuiz?.id;
        }

        if (quizId && artifacts.quiz.questions.length > 0) {
          await withAppSpan(
            "saveStudyArtifacts.quiz",
            "db.query",
            {
              feature: "quiz",
              studySetId,
              quizQuestionCount: artifacts.quiz.questions.length,
            },
            () =>
              supabase.from("quiz_questions").insert(
                artifacts.quiz.questions.map((q) => ({
                  quiz_id: quizId,
                  question: q.question,
                  choices: q.choices,
                  correct_answer: q.correct_answer,
                  explanation: q.explanation,
                }))
              )
          );
        }

        return {
          success: true,
          summarySaved: true,
          flashcardCount: artifacts.flashcards.length,
          quizQuestionCount: artifacts.quiz.questions.length,
        };
      }
    );
  } catch (error) {
    captureAppError(error, {
      feature: "study_generation",
      studySetId,
      tool: "saveStudyArtifacts",
      extra: {
        flashcardCount: artifacts.flashcards.length,
        quizQuestionCount: artifacts.quiz.questions.length,
      },
    });
    throw error;
  }
}

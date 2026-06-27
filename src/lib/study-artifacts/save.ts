import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { StudyArtifacts } from "@/lib/study-artifacts/schemas";
import type { CardType } from "@/lib/types";
import { captureAppError, withAppSpan } from "@/lib/sentry";

const FLASHCARD_MIGRATION_HINT =
  "Run supabase/migrations/002_flashcard_card_types.sql in the Supabase SQL editor to enable typed and cloze flashcards.";

function assertSupabaseOk(
  error: PostgrestError | null,
  context: string
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function isMissingFlashcardColumnError(error: PostgrestError): boolean {
  return (
    error.code === "PGRST204" &&
    /flashcards/i.test(error.message ?? "")
  );
}

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

function normalizeFlashcardForLegacySave(
  card: StudyArtifacts["flashcards"][number]
) {
  const normalized = normalizeFlashcardForSave(card);
  let back = normalized.back;

  if (normalized.explanation) {
    back = `${back}\n\n${normalized.explanation}`;
  }

  return {
    front: normalized.front,
    back,
    difficulty: normalized.difficulty,
  };
}

async function insertFlashcards(
  supabase: SupabaseClient,
  studySetId: string,
  cards: StudyArtifacts["flashcards"]
): Promise<void> {
  if (cards.length === 0) return;

  const rows = cards.map((card) => ({
    study_set_id: studySetId,
    ...normalizeFlashcardForSave(card),
  }));

  const { error } = await supabase.from("flashcards").insert(rows);

  if (!error) return;

  if (!isMissingFlashcardColumnError(error)) {
    assertSupabaseOk(error, "Failed to save flashcards");
    return;
  }

  console.warn(
    "[saveStudyArtifacts] flashcards table is missing typed-card columns; saving basic flashcards only.",
    FLASHCARD_MIGRATION_HINT
  );
  captureAppError(new Error(error.message), {
    feature: "flashcards",
    studySetId,
    tool: "saveStudyArtifacts",
    extra: {
      fallback: "legacy_flashcard_schema",
      migrationHint: FLASHCARD_MIGRATION_HINT,
    },
  });

  const legacyRows = cards.map((card) => ({
    study_set_id: studySetId,
    ...normalizeFlashcardForLegacySave(card),
  }));

  const { error: legacyError } = await supabase
    .from("flashcards")
    .insert(legacyRows);
  assertSupabaseOk(legacyError, "Failed to save flashcards (legacy schema)");
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
        const { error: summaryError } = await supabase
          .from("study_sets")
          .update({
            summary: artifacts.summary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", studySetId);
        assertSupabaseOk(summaryError, "Failed to save summary");

        const { error: deleteFlashcardsError } = await supabase
          .from("flashcards")
          .delete()
          .eq("study_set_id", studySetId);
        assertSupabaseOk(deleteFlashcardsError, "Failed to clear flashcards");

        await withAppSpan(
          "saveStudyArtifacts.flashcards",
          "db.query",
          {
            feature: "flashcards",
            studySetId,
            flashcardCount: artifacts.flashcards.length,
          },
          () => insertFlashcards(supabase, studySetId, artifacts.flashcards)
        );

        const { data: existingQuiz } = await supabase
          .from("quizzes")
          .select("id")
          .eq("study_set_id", studySetId)
          .maybeSingle();

        let quizId = existingQuiz?.id;

        if (quizId) {
          const { error: deleteQuestionsError } = await supabase
            .from("quiz_questions")
            .delete()
            .eq("quiz_id", quizId);
          assertSupabaseOk(deleteQuestionsError, "Failed to clear quiz questions");

          const { error: updateQuizError } = await supabase
            .from("quizzes")
            .update({ title: artifacts.quiz.title })
            .eq("id", quizId);
          assertSupabaseOk(updateQuizError, "Failed to update quiz");
        } else {
          const { data: newQuiz, error: createQuizError } = await supabase
            .from("quizzes")
            .insert({
              study_set_id: studySetId,
              title: artifacts.quiz.title,
            })
            .select("id")
            .single();
          assertSupabaseOk(createQuizError, "Failed to create quiz");
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
            async () => {
              const { error: insertQuestionsError } = await supabase
                .from("quiz_questions")
                .insert(
                  artifacts.quiz.questions.map((q) => ({
                    quiz_id: quizId,
                    question: q.question,
                    choices: q.choices,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                  }))
                );
              assertSupabaseOk(insertQuestionsError, "Failed to save quiz questions");
            }
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

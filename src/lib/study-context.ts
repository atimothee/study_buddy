import { createClient } from "@/lib/supabase/server";
import type { Flashcard, QuizQuestion, StudySet } from "@/lib/types";

export interface StudySetContext {
  studySet: Pick<StudySet, "id" | "title" | "subject" | "source_text" | "summary">;
  flashcards: Pick<Flashcard, "front" | "back" | "difficulty">[];
  quizQuestions: Pick<
    QuizQuestion,
    "question" | "choices" | "correct_answer" | "explanation"
  >[];
}

export async function getStudySetContext(
  studySetId: string,
  userId: string
): Promise<StudySetContext | null> {
  const supabase = await createClient();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("id, title, subject, source_text, summary")
    .eq("id", studySetId)
    .eq("user_id", userId)
    .single();

  if (!studySet) return null;

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("front, back, difficulty")
    .eq("study_set_id", studySetId);

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("study_set_id", studySetId)
    .limit(1);

  let quizQuestions: StudySetContext["quizQuestions"] = [];

  if (quizzes?.[0]) {
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("question, choices, correct_answer, explanation")
      .eq("quiz_id", quizzes[0].id);

    quizQuestions = (questions ?? []).map((q) => ({
      ...q,
      choices: q.choices as string[],
    }));
  }

  return {
    studySet,
    flashcards: flashcards ?? [],
    quizQuestions,
  };
}

export function formatContextForPrompt(ctx: StudySetContext): string {
  const parts = [
    `# Study Set: ${ctx.studySet.title}`,
    ctx.studySet.subject ? `Subject: ${ctx.studySet.subject}` : "",
    ctx.studySet.summary ? `\n## Summary\n${ctx.studySet.summary}` : "",
    ctx.studySet.source_text
      ? `\n## Source Material\n${ctx.studySet.source_text}`
      : "",
  ];

  if (ctx.flashcards.length > 0) {
    parts.push("\n## Flashcards");
    ctx.flashcards.forEach((card, i) => {
      parts.push(
        `${i + 1}. Q: ${card.front}\n   A: ${card.back} (${card.difficulty})`
      );
    });
  }

  if (ctx.quizQuestions.length > 0) {
    parts.push("\n## Quiz Questions");
    ctx.quizQuestions.forEach((q, i) => {
      parts.push(
        `${i + 1}. ${q.question}\n   Choices: ${q.choices.join(", ")}\n   Answer: ${q.correct_answer}`
      );
    });
  }

  return parts.filter(Boolean).join("\n");
}

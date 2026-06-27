import { defineTool } from "eve/tools";
import { z } from "zod";
import { createServiceClient } from "../../src/lib/supabase/admin";
import { generatePracticeQuestion } from "../../src/lib/ai/generation";
import { formatContextForPrompt } from "../../src/lib/study-context";

export default defineTool({
  description:
    "Generate one additional multiple-choice practice question from the study set material.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  async execute({ studySetId, userId }) {
    const supabase = createServiceClient();

    const { data: studySet } = await supabase
      .from("study_sets")
      .select("id, title, subject, source_text, summary")
      .eq("id", studySetId)
      .eq("user_id", userId)
      .single();

    if (!studySet) {
      return { error: "Study set not found" };
    }

    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("front, back, difficulty")
      .eq("study_set_id", studySetId);

    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id")
      .eq("study_set_id", studySetId)
      .limit(1);

    let quizQuestions: Array<{
      question: string;
      choices: string[];
      correct_answer: string;
      explanation: string | null;
    }> = [];

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

    const context = formatContextForPrompt({
      studySet,
      flashcards: flashcards ?? [],
      quizQuestions,
    });

    const question = await generatePracticeQuestion(context);
    return { question };
  },
});

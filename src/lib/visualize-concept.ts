import { createClient } from "@/lib/supabase/server";
import {
  resolveVisualizationConcept,
  VISUAL_CLARIFY_MESSAGE,
} from "@/lib/concept-grounding";
import {
  buildVisualizationResult,
  type VisualizationResult,
  type VisualizationStudyContext,
} from "@/lib/visualization-build";
import { buildFallbackVisualization } from "@/lib/visualization-fallback";

export interface VisualizeConceptInput {
  studySetId: string;
  userId: string;
  message: string;
  conceptOverride?: string;
  recentMessages?: Array<{ role: string; content: string }>;
}

export type VisualizeConceptOutput =
  | { status: "visual"; visual: VisualizationResult }
  | { status: "clarify"; message: string }
  | { status: "error"; message: string };

async function loadStudyContext(
  studySetId: string,
  userId: string
): Promise<VisualizationStudyContext | null> {
  const supabase = await createClient();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("id, title, summary, source_text")
    .eq("id", studySetId)
    .eq("user_id", userId)
    .single();

  if (!studySet) return null;

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("front, back")
    .eq("study_set_id", studySetId);

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("study_set_id", studySetId)
    .limit(1);

  let quizQuestions: VisualizationStudyContext["quizQuestions"] = [];

  if (quizzes?.[0]) {
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("question, explanation, correct_answer")
      .eq("quiz_id", quizzes[0].id);

    quizQuestions = (questions ?? []).map((question) => ({
      question: question.question,
      explanation: question.explanation ?? undefined,
      correctAnswer: question.correct_answer,
    }));
  }

  return {
    studySet: {
      title: studySet.title,
      summary: studySet.summary ?? undefined,
      sourceText: studySet.source_text ?? "",
    },
    flashcards: flashcards ?? [],
    quizQuestions,
  };
}

export async function runVisualizeConcept(
  input: VisualizeConceptInput
): Promise<VisualizeConceptOutput> {
  const context = await loadStudyContext(input.studySetId, input.userId);
  if (!context) {
    return { status: "error", message: "Study set not found" };
  }

  const resolution = input.conceptOverride
    ? { concept: input.conceptOverride, needsClarification: false }
    : resolveVisualizationConcept(
        input.message,
        input.recentMessages ?? []
      );

  if (resolution.needsClarification || !resolution.concept) {
    return { status: "clarify", message: VISUAL_CLARIFY_MESSAGE };
  }

  const result = await buildVisualizationResult(
    context,
    resolution.concept,
    input.message
  );

  if ("error" in result) {
    return {
      status: "visual",
      visual: buildFallbackVisualization(
        resolution.concept,
        context.studySet.title,
        context.studySet.summary?.slice(0, 240) ?? ""
      ),
    };
  }

  return { status: "visual", visual: result };
}

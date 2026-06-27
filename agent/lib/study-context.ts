import { createServiceClient } from "./supabase.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";
import {
  findBestGroundingSnippet,
  isConceptGrounded,
} from "../../src/lib/concept-grounding.js";

export interface StudySetContextResult {
  studySet: {
    id: string;
    title: string;
    subject?: string;
    sourceText: string;
    summary?: string;
  };
  flashcards: Array<{
    front: string;
    back: string;
    difficulty?: string;
  }>;
  quizQuestions: Array<{
    question: string;
    choices: string[];
    correctAnswer: string;
    explanation?: string;
  }>;
  recentMessages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

export async function fetchStudySetContext(
  studySetId: string,
  userId: string
): Promise<StudySetContextResult | { error: string }> {
  try {
    return await withAppSpan(
      "agent.fetchStudySetContext",
      "db.query",
      { feature: "chat", studySetId, userId },
      async () => {
        const supabase = createServiceClient();

        const { data: studySet, error } = await supabase
          .from("study_sets")
          .select("id, title, subject, source_text, summary")
          .eq("id", studySetId)
          .eq("user_id", userId)
          .single();

        if (error || !studySet) {
          return { error: "Study set not found or access denied" };
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

        let quizQuestions: StudySetContextResult["quizQuestions"] = [];

        if (quizzes?.[0]) {
          const { data: questions } = await supabase
            .from("quiz_questions")
            .select("question, choices, correct_answer, explanation")
            .eq("quiz_id", quizzes[0].id);

          quizQuestions = (questions ?? []).map((q) => ({
            question: q.question,
            choices: q.choices as string[],
            correctAnswer: q.correct_answer,
            explanation: q.explanation ?? undefined,
          }));
        }

        const { data: recentMessages } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("study_set_id", studySetId)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(12);

        return {
          studySet: {
            id: studySet.id,
            title: studySet.title,
            subject: studySet.subject ?? undefined,
            sourceText: studySet.source_text ?? "",
            summary: studySet.summary ?? undefined,
          },
          flashcards: (flashcards ?? []).map((card) => ({
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
          })),
          quizQuestions,
          recentMessages: (recentMessages ?? [])
            .reverse()
            .map((m) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
        };
      }
    );
  } catch (error) {
    captureAppError(error, {
      feature: "chat",
      userId,
      studySetId,
      tool: "fetchStudySetContext",
    });
    return { error: "Failed to load study set context" };
  }
}

export function formatStudyContextForPrompt(
  context: StudySetContextResult
): string {
  const parts = [
    `# Study Set: ${context.studySet.title}`,
    context.studySet.subject ? `Subject: ${context.studySet.subject}` : "",
    context.studySet.summary
      ? `\n## Summary\n${context.studySet.summary}`
      : "",
    context.studySet.sourceText
      ? `\n## Source Material\n${context.studySet.sourceText}`
      : "",
  ];

  if (context.flashcards.length > 0) {
    parts.push("\n## Flashcards");
    context.flashcards.forEach((card, i) => {
      parts.push(
        `${i + 1}. Q: ${card.front}\n   A: ${card.back}${card.difficulty ? ` (${card.difficulty})` : ""}`
      );
    });
  }

  if (context.quizQuestions.length > 0) {
    parts.push("\n## Quiz Questions");
    context.quizQuestions.forEach((q, i) => {
      parts.push(
        `${i + 1}. ${q.question}\n   Choices: ${q.choices.join(", ")}\n   Answer: ${q.correctAnswer}`
      );
    });
  }

  return parts.filter(Boolean).join("\n");
}

export function findConceptGrounding(
  context: StudySetContextResult,
  concept: string
): string {
  const sources = [
    context.studySet.summary ?? "",
    context.studySet.sourceText,
    ...context.flashcards.map((c) => `${c.front} ${c.back}`),
    ...context.quizQuestions.map((q) => `${q.question} ${q.explanation ?? ""}`),
  ];

  if (!isConceptGrounded(sources, concept)) {
    return "";
  }

  return findBestGroundingSnippet(sources, concept) || concept;
}

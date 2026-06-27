import { z } from "zod";

export const MIN_SOURCE_TEXT_LENGTH = 100;

export const cardTypeSchema = z.enum([
  "basic",
  "cloze",
  "definition",
  "compare_contrast",
  "application",
]);

/**
 * OpenAI structured output rejects nullable/optional fields and array length
 * constraints in JSON Schema. Use plain strings/arrays; normalize after generation.
 */
export const generationFlashcardSchema = z.object({
  card_type: cardTypeSchema,
  front: z.string(),
  back: z.string(),
  cloze_text: z.string(),
  answer: z.string(),
  explanation: z.string(),
  tags: z.array(z.string()),
  source_quote: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const generationQuizQuestionSchema = z.object({
  question: z.string(),
  choice_a: z.string(),
  choice_b: z.string(),
  choice_c: z.string(),
  choice_d: z.string(),
  correct_answer: z.string(),
  explanation: z.string(),
});

export const flashcardSchema = z.object({
  card_type: cardTypeSchema.default("basic"),
  front: z.string(),
  back: z.string(),
  cloze_text: z.string().nullable().optional(),
  answer: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  source_quote: z.string().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).min(4).max(4),
  correct_answer: z.string(),
  explanation: z.string(),
});

export const studyArtifactsSchema = z.object({
  summary: z.string(),
  flashcards: z.array(flashcardSchema),
  quiz: z.object({
    title: z.string(),
    questions: z.array(quizQuestionSchema),
  }),
});

export type StudyArtifacts = z.infer<typeof studyArtifactsSchema>;

export const generateStudyArtifactsOptionsSchema = z.object({
  flashcardCount: z.number().int().min(10).max(20).optional(),
  quizQuestionCount: z.number().int().min(5).max(10).optional(),
  includeSummary: z.boolean().optional(),
  includeFlashcards: z.boolean().optional(),
  includeQuiz: z.boolean().optional(),
});

export type GenerateStudyArtifactsOptions = z.infer<
  typeof generateStudyArtifactsOptionsSchema
>;

export type GenerationArtifacts = z.infer<
  ReturnType<typeof buildGenerationSchema>
>;

export function buildGenerationSchema(options?: GenerateStudyArtifactsOptions) {
  const flashcardMin = options?.flashcardCount ?? 10;
  const flashcardMax = options?.flashcardCount ?? 20;
  const quizMin = options?.quizQuestionCount ?? 5;
  const quizMax = options?.quizQuestionCount ?? 10;

  return z.object({
    summary: z.string(),
    flashcards: z
      .array(generationFlashcardSchema)
      .min(options?.includeFlashcards === false ? 0 : flashcardMin)
      .max(flashcardMax),
    quiz: z.object({
      title: z.string(),
      questions: z
        .array(generationQuizQuestionSchema)
        .min(options?.includeQuiz === false ? 0 : quizMin)
        .max(quizMax),
    }),
  });
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeGenerationArtifacts(
  generated: GenerationArtifacts
): StudyArtifacts {
  return {
    summary: generated.summary,
    flashcards: generated.flashcards.map((card) => ({
      card_type: card.card_type,
      front: card.front,
      back: card.back,
      cloze_text: emptyToNull(card.cloze_text),
      answer: emptyToNull(card.answer),
      explanation: emptyToNull(card.explanation),
      tags: card.tags.length > 0 ? card.tags : null,
      source_quote: emptyToNull(card.source_quote),
      difficulty: card.difficulty,
    })),
    quiz: {
      title: generated.quiz.title,
      questions: generated.quiz.questions.map((question) => ({
        question: question.question,
        choices: [
          question.choice_a,
          question.choice_b,
          question.choice_c,
          question.choice_d,
        ],
        correct_answer: question.correct_answer,
        explanation: question.explanation,
      })),
    },
  };
}

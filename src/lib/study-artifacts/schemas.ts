import { z } from "zod";

export const MIN_SOURCE_TEXT_LENGTH = 100;

export const cardTypeSchema = z.enum([
  "basic",
  "cloze",
  "definition",
  "compare_contrast",
  "application",
]);

/** OpenAI structured output requires every property to be required (use null for absent values). */
export const generationFlashcardSchema = z.object({
  card_type: cardTypeSchema,
  front: z.string(),
  back: z.string(),
  cloze_text: z.string().nullable(),
  answer: z.string().nullable(),
  explanation: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  source_quote: z.string().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]),
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
        .array(quizQuestionSchema)
        .min(options?.includeQuiz === false ? 0 : quizMin)
        .max(quizMax),
    }),
  });
}

import { generateObject } from "ai";
import { openai } from "@/lib/ai/client";
import { z } from "zod";
import type { GenerationResult } from "@/lib/types";

const generationSchema = z.object({
  summary: z.string(),
  flashcards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
      })
    )
    .min(10)
    .max(20),
  quiz: z.object({
    title: z.string(),
    questions: z
      .array(
        z.object({
          question: z.string(),
          choices: z.array(z.string()).min(4).max(4),
          correct_answer: z.string(),
          explanation: z.string(),
        })
      )
      .min(5)
      .max(10),
  }),
});

const SYSTEM_PROMPT = `You are StudyBuddy, an expert study content generator.

Rules:
- Generate content ONLY from the provided source material.
- Do NOT invent facts, names, dates, or concepts not present in the source.
- If the source is too vague to support a fact, omit it rather than guessing.
- Flashcards must be atomic (one concept per card) and useful for active recall.
- Quiz questions should test understanding, not just rote memorization.
- Every quiz question must have exactly 4 choices and a clear explanation.
- correct_answer must exactly match one of the choices strings.
- Write a concise summary (2-4 paragraphs) of the key points.`;

export async function generateStudyContent(
  sourceText: string
): Promise<GenerationResult> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: generationSchema,
    system: SYSTEM_PROMPT,
    prompt: `Generate study materials from this source text:\n\n${sourceText}`,
  });

  return object;
}

export async function generatePracticeQuestion(context: string) {
  const schema = z.object({
    question: z.string(),
    choices: z.array(z.string()).length(4),
    correct_answer: z.string(),
    explanation: z.string(),
  });

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema,
    system: `Generate one multiple-choice practice question grounded ONLY in the study material. Do not invent facts.`,
    prompt: `Study material:\n\n${context}`,
  });

  return object;
}

import { generateObject } from "ai";
import { openai } from "@/lib/ai/client";
import { z } from "zod";
import type { GenerationResult } from "@/lib/types";
import { generateStudyArtifactsFromSource } from "@/lib/study-artifacts/generate";

export async function generateStudyContent(
  sourceText: string
): Promise<GenerationResult> {
  return generateStudyArtifactsFromSource(sourceText);
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

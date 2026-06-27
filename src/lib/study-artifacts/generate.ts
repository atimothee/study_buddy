import { generateObject } from "ai";
import { openai } from "@/lib/ai/client";
import {
  buildGenerationSchema,
  MIN_SOURCE_TEXT_LENGTH,
  type GenerateStudyArtifactsOptions,
  type StudyArtifacts,
} from "@/lib/study-artifacts/schemas";
import { bucketSourceLength, captureAppError, withAppSpan } from "@/lib/sentry";

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

export function isSourceTextTooShort(sourceText: string | null | undefined): boolean {
  return !sourceText || sourceText.trim().length < MIN_SOURCE_TEXT_LENGTH;
}

export async function generateStudyArtifactsFromSource(
  sourceText: string,
  options?: GenerateStudyArtifactsOptions
): Promise<StudyArtifacts> {
  const sourceLengthBucket = bucketSourceLength(sourceText.length);

  try {
    const schema = buildGenerationSchema(options);

    const { object } = await withAppSpan(
      "llm.generateStudyArtifacts",
      "ai.generation",
      { feature: "study_generation", sourceLengthBucket },
      () =>
        generateObject({
          model: openai("gpt-4o-mini"),
          schema,
          system: SYSTEM_PROMPT,
          prompt: `Generate study materials from this source text:\n\n${sourceText}`,
        })
    );

    return object;
  } catch (error) {
    captureAppError(error, {
      feature: "study_generation",
      tool: "generateStudyArtifacts",
      extra: { sourceLengthBucket },
    });
    throw new Error("We could not generate your study materials. Please try again.");
  }
}

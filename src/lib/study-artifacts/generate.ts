import { generateObject } from "ai";
import { getGenerationModel } from "@/lib/ai/client";
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
- Include a mix of card types: basic, cloze, definition, compare_contrast, and application.
- Aim for roughly 30-40% cloze deletion cards when the source supports it.
- For cloze cards: set card_type to "cloze", put the full sentence in cloze_text with exactly one {{hidden answer}} per card (use {{answer}} syntax). Also set front (sentence with blanks), back (sentence with answer revealed), answer (the hidden text), and explanation.
- Prefer one cloze per card unless multiple clozes are tightly related in the same sentence.
- For definition cards: front = term, back = definition from source.
- For compare_contrast cards: front = comparison prompt, back = contrast from source.
- For application cards: front = scenario/question, back = application of concept from source.
- Add 1-3 relevant tags per card when possible. Include source_quote when a direct quote grounds the card.
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
          model: getGenerationModel(),
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

    const message =
      error instanceof Error ? error.message : "Unknown generation error";
    if (/missing ai_gateway|missing openai|authentication failed|api key/i.test(message)) {
      throw new Error(
        "AI generation is not configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY on the server."
      );
    }

    throw new Error("We could not generate your study materials. Please try again.");
  }
}

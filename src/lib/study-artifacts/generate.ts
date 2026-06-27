import { generateObject } from "ai";
import { getGenerationModelCandidates } from "@/lib/ai/client";
import {
  buildGenerationSchema,
  MIN_SOURCE_TEXT_LENGTH,
  normalizeGenerationArtifacts,
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
- For unused flashcard fields (cloze_text, answer, explanation, source_quote), use an empty string.
- For cards with no tags, return an empty tags array.
- Quiz questions should test understanding, not just rote memorization.
- Every quiz question must have exactly 4 choices via choice_a, choice_b, choice_c, and choice_d.
- correct_answer must exactly match one of the four choice strings.
- Write a concise summary (2-4 paragraphs) of the key points.`;

function isAuthOrConfigError(message: string): boolean {
  return /missing ai_gateway|missing openai|authentication failed|api key|unauthenticated/i.test(
    message
  );
}

function isInvalidSchemaError(message: string): boolean {
  return /invalid schema|invalid_json_schema/i.test(message);
}

export function isSourceTextTooShort(sourceText: string | null | undefined): boolean {
  return !sourceText || sourceText.trim().length < MIN_SOURCE_TEXT_LENGTH;
}

export async function generateStudyArtifactsFromSource(
  sourceText: string,
  options?: GenerateStudyArtifactsOptions
): Promise<StudyArtifacts> {
  const sourceLengthBucket = bucketSourceLength(sourceText.length);
  const schema = buildGenerationSchema(options);
  const prompt = `Generate study materials from this source text:\n\n${sourceText}`;

  const models = getGenerationModelCandidates();
  let lastError: unknown;

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index]!;

    try {
      const { object } = await withAppSpan(
        "llm.generateStudyArtifacts",
        "ai.generation",
        {
          feature: "study_generation",
          sourceLengthBucket,
          modelIndex: index,
        },
        () =>
          generateObject({
            model,
            schema,
            system: SYSTEM_PROMPT,
            prompt,
          })
      );

      return normalizeGenerationArtifacts(object);
    } catch (error) {
      lastError = error;
      const message =
        error instanceof Error ? error.message : "Unknown generation error";

      captureAppError(error, {
        feature: "study_generation",
        tool: "generateStudyArtifacts",
        extra: { sourceLengthBucket, modelIndex: index, message },
      });

      const hasFallback = index < models.length - 1;
      if (hasFallback && (isAuthOrConfigError(message) || isInvalidSchemaError(message))) {
        continue;
      }

      if (isAuthOrConfigError(message)) {
        throw new Error(
          "AI generation is not configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY on the server."
        );
      }

      throw new Error(
        "We could not generate your study materials. Please try again."
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("We could not generate your study materials. Please try again.");
}

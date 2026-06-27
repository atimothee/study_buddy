import { generateText } from "ai";
import { openai } from "@/lib/ai/client";
import { formatContextForPrompt } from "@/lib/study-context";
import type { StudySetContext } from "@/lib/study-context";
import { captureAppError, withAppSpan } from "@/lib/sentry";

const XIAOHEI_IMAGE_MODEL = "google/gemini-2.0-flash-preview-image-generation";

const XIAOHEI_STYLE_PROMPT = `Create a 16:9 horizontal educational illustration in the Ian Xiaohei style (ian-xiaohei-illustrations-en):
- Pure white background, no texture, shadows, or gradients
- Black hand-drawn line art with slight wobble, thin lines
- Character "Xiaohei": solid black figure with white-dot eyes, thin legs, blank expression
- Xiaohei must perform the core action explaining the concept
- Sparse red, orange, and blue handwritten English annotations
- Lots of empty space; subject occupies only 40-60% of the frame
- One clear visual metaphor for the concept
- Not a PPT slide, not cute cartoon, not commercial illustration
- English labels only`;

export async function visualizeConceptFromContext(
  concept: string,
  context: StudySetContext
): Promise<{ imageDataUrl: string; caption: string } | { error: string }> {
  const contextText = formatContextForPrompt(context);

  const prompt = `${XIAOHEI_STYLE_PROMPT}

Concept to visualize: ${concept}

Ground the illustration in this study material (do not invent facts beyond it):
${contextText}`;

  try {
    const result = await withAppSpan(
      "llm.visualizeConcept",
      "ai.generation",
      {
        feature: "visualization",
        studySetId: context.studySet.id,
        conceptLength: concept.length,
      },
      () =>
        generateText({
          model: openai(XIAOHEI_IMAGE_MODEL),
          prompt,
        })
    );

    const imageFile = result.files?.find((f) =>
      f.mediaType?.startsWith("image/")
    );

    if (!imageFile?.uint8Array) {
      return {
        error:
          "Image generation is unavailable. Ensure AI_GATEWAY_API_KEY is configured with an image-capable model.",
      };
    }

    const mediaType = imageFile.mediaType ?? "image/png";
    const base64 = Buffer.from(imageFile.uint8Array).toString("base64");

    return {
      imageDataUrl: `data:${mediaType};base64,${base64}`,
      caption: `Visual explanation: ${concept}`,
    };
  } catch (err) {
    captureAppError(err, {
      feature: "visualization",
      studySetId: context.studySet.id,
      tool: "visualizeConcept",
      extra: { conceptLength: concept.length },
    });
    return { error: "Failed to generate concept illustration" };
  }
}

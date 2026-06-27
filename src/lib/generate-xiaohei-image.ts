import { generateText } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { withAppSpan } from "@/lib/sentry";

const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image";

function getImageModel(): string {
  return process.env.XIAOHEI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;
}

function getGateway() {
  const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing AI_GATEWAY_API_KEY or OPENAI_API_KEY");
  }
  return createGateway({ apiKey });
}

export async function generateXiaoheiImage(
  prompt: string
): Promise<{ dataUrl: string } | { error: string }> {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return { error: "No AI API key configured for image generation" };
  }

  try {
    const dataUrl = await withAppSpan(
      "xiaohei.generateImage",
      "ai.image",
      { feature: "visualization", model: getImageModel() },
      async () => {
        const gateway = getGateway();
        const result = await generateText({
          model: gateway(getImageModel()),
          prompt,
        });

        const imageFile = result.files?.find((file) =>
          file.mediaType?.startsWith("image/")
        );

        if (!imageFile?.uint8Array) {
          throw new Error("Model did not return an image file");
        }

        const mediaType = imageFile.mediaType ?? "image/png";
        const base64 = Buffer.from(imageFile.uint8Array).toString("base64");
        return `data:${mediaType};base64,${base64}`;
      }
    );

    return { dataUrl };
  } catch (err) {
    console.error("Xiaohei image generation failed:", err);
    return {
      error:
        err instanceof Error ? err.message : "Image generation failed",
    };
  }
}

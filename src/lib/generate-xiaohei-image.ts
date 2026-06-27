import { generateImage, generateText } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import { withAppSpan } from "@/lib/sentry";

const DEFAULT_GATEWAY_IMAGE_MODEL = "google/gemini-2.5-flash-image";
/** dall-e-3 is deprecated on many accounts; gpt-image-1 works with the AI SDK. */
const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-1";

function getTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getGatewayImageModel(): string {
  return process.env.XIAOHEI_IMAGE_MODEL ?? DEFAULT_GATEWAY_IMAGE_MODEL;
}

function getOpenAiImageModel(): string {
  return process.env.XIAOHEI_OPENAI_IMAGE_MODEL ?? DEFAULT_OPENAI_IMAGE_MODEL;
}

function hasAiKey(): boolean {
  return Boolean(
    getTrimmedEnv("AI_GATEWAY_API_KEY") || getTrimmedEnv("OPENAI_API_KEY")
  );
}

function toDataUrl(mediaType: string, base64: string): string {
  return `data:${mediaType};base64,${base64}`;
}

async function generateViaGateway(prompt: string): Promise<string> {
  const apiKey = getTrimmedEnv("AI_GATEWAY_API_KEY");
  if (!apiKey) {
    throw new Error("Missing AI_GATEWAY_API_KEY for gateway image generation");
  }

  const modelId = getGatewayImageModel();
  const gateway = createGateway({ apiKey });

  if (modelId.startsWith("openai/")) {
    const { image } = await generateImage({
      model: gateway.imageModel(modelId),
      prompt,
      size: "1024x1024",
    });

    return toDataUrl(image.mediaType ?? "image/png", image.base64);
  }

  const result = await generateText({
    model: gateway(modelId),
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
  return toDataUrl(mediaType, base64);
}

async function generateViaOpenAi(prompt: string): Promise<string> {
  const apiKey = getTrimmedEnv("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY for image generation");
  }

  const openai = createOpenAI({ apiKey });
  const { image } = await generateImage({
    model: openai.image(getOpenAiImageModel()),
    prompt,
    size: "1024x1024",
  });

  return toDataUrl(image.mediaType ?? "image/png", image.base64);
}

async function generateWithFallback(prompt: string): Promise<string> {
  const errors: string[] = [];

  if (getTrimmedEnv("AI_GATEWAY_API_KEY")) {
    try {
      return await generateViaGateway(prompt);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gateway image generation failed";
      errors.push(`Gateway (${getGatewayImageModel()}): ${message}`);
      console.warn("Xiaohei gateway image generation failed:", message);
    }
  }

  if (getTrimmedEnv("OPENAI_API_KEY")) {
    try {
      return await generateViaOpenAi(prompt);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "OpenAI image generation failed";
      errors.push(`OpenAI (${getOpenAiImageModel()}): ${message}`);
    }
  }

  throw new Error(
    errors.length > 0
      ? errors.join("; ")
      : "No AI API key configured for image generation"
  );
}

export async function generateXiaoheiImage(
  prompt: string
): Promise<{ dataUrl: string } | { error: string }> {
  if (!hasAiKey()) {
    return { error: "No AI API key configured for image generation" };
  }

  const spanModel = getTrimmedEnv("AI_GATEWAY_API_KEY")
    ? getGatewayImageModel()
    : getOpenAiImageModel();

  try {
    const dataUrl = await withAppSpan(
      "xiaohei.generateImage",
      "ai.image",
      {
        feature: "visualization",
        model: spanModel,
      },
      () => generateWithFallback(prompt)
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

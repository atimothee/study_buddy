import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

const GENERATION_MODEL = "gpt-4o-mini";
const GATEWAY_GENERATION_MODEL = "openai/gpt-4o-mini";

export const AI_NOT_CONFIGURED_MESSAGE =
  "AI is not configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY in your Vercel project settings, then redeploy.";

function getTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function isAiConfigured(): boolean {
  return Boolean(
    getTrimmedEnv("AI_GATEWAY_API_KEY") || getTrimmedEnv("OPENAI_API_KEY")
  );
}

/** True when no AI provider keys are configured (force /api/chat, which will 503). */
export function shouldUseFallbackChat(): boolean {
  return !isAiConfigured();
}

export function assertAiConfigured(): void {
  if (!isAiConfigured()) {
    throw new Error(AI_NOT_CONFIGURED_MESSAGE);
  }
}

function getOpenAiDirect() {
  const apiKey = getTrimmedEnv("OPENAI_API_KEY");
  if (!apiKey) return null;
  return createOpenAI({ apiKey });
}

function getGateway() {
  const apiKey = getTrimmedEnv("AI_GATEWAY_API_KEY");
  if (!apiKey) return null;
  return createGateway({ apiKey });
}

/**
 * Ordered model candidates for study generation.
 * Tries AI Gateway first when configured, then direct OpenAI.
 */
export function getGenerationModelCandidates(): LanguageModel[] {
  const models: LanguageModel[] = [];
  const gateway = getGateway();
  const openai = getOpenAiDirect();

  if (gateway) {
    models.push(gateway(GATEWAY_GENERATION_MODEL));
  }
  if (openai) {
    models.push(openai(GENERATION_MODEL));
  }

  if (models.length === 0) {
    throw new Error(
      "Missing AI_GATEWAY_API_KEY or OPENAI_API_KEY for study generation"
    );
  }

  return models;
}

/** First available generation model. */
export function getGenerationModel(): LanguageModel {
  return getGenerationModelCandidates()[0]!;
}

/** First available model for streaming chat. */
export function getChatModel(): LanguageModel {
  return getGenerationModel();
}

let cachedOpenAiProvider: ReturnType<typeof createOpenAI> | null = null;

/** OpenAI provider for legacy call sites; validates env on first use. */
export function getOpenAiProvider(): ReturnType<typeof createOpenAI> {
  if (cachedOpenAiProvider) return cachedOpenAiProvider;

  const gatewayKey = getTrimmedEnv("AI_GATEWAY_API_KEY");
  const openaiKey = getTrimmedEnv("OPENAI_API_KEY");

  if (gatewayKey) {
    cachedOpenAiProvider = createOpenAI({
      apiKey: gatewayKey,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    });
    return cachedOpenAiProvider;
  }

  if (openaiKey) {
    cachedOpenAiProvider = createOpenAI({ apiKey: openaiKey });
    return cachedOpenAiProvider;
  }

  throw new Error(AI_NOT_CONFIGURED_MESSAGE);
}

/** @deprecated Use getOpenAiProvider() or getChatModel(). */
export const openai = ((modelId: string) =>
  getOpenAiProvider()(modelId)) as ReturnType<typeof createOpenAI>;

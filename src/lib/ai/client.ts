import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

const GENERATION_MODEL = "gpt-4o-mini";
const GATEWAY_GENERATION_MODEL = "openai/gpt-4o-mini";

function getTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
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
 * Model for study generation, chat, and practice questions.
 * Prefers Vercel AI Gateway when configured; falls back to OpenAI directly.
 */
export function getGenerationModel(): LanguageModel {
  const gateway = getGateway();
  if (gateway) {
    return gateway(GATEWAY_GENERATION_MODEL);
  }

  const openai = getOpenAiDirect();
  if (openai) {
    return openai(GENERATION_MODEL);
  }

  throw new Error(
    "Missing AI_GATEWAY_API_KEY or OPENAI_API_KEY for study generation"
  );
}

/** @deprecated Use getGenerationModel() for new code. */
export const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_API_KEY
    ? "https://ai-gateway.vercel.sh/v1"
    : undefined,
});

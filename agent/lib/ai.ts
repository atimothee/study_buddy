import { createOpenAI } from "@ai-sdk/openai";

function getTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

const gatewayKey = getTrimmedEnv("AI_GATEWAY_API_KEY");
const openaiKey = getTrimmedEnv("OPENAI_API_KEY");

export const openai = createOpenAI({
  apiKey: gatewayKey ?? openaiKey ?? "",
  baseURL: gatewayKey ? "https://ai-gateway.vercel.sh/v1" : undefined,
});

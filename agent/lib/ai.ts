import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_API_KEY
    ? "https://ai-gateway.vercel.sh/v1"
    : undefined,
});

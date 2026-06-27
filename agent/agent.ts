import { defineAgent } from "eve";
import { openai } from "./lib/ai.js";

/**
 * StudyBuddy Eve agent — source-grounded study chat.
 * Mounted via withEve() in next.config.ts.
 *
 * Gateway model ids (openai/gpt-4o-mini) require AI_GATEWAY_API_KEY.
 * With OPENAI_API_KEY alone, use a direct LanguageModel like generation does.
 *
 * @see https://vercel.com/eve
 */
export default defineAgent({
  model: process.env.AI_GATEWAY_API_KEY?.trim()
    ? "openai/gpt-4o-mini"
    : openai("gpt-4o-mini"),
});

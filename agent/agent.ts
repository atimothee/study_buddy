import { defineAgent } from "eve";

/**
 * StudyBuddy Eve agent — source-grounded study chat.
 * Mounted via withEve() in next.config.ts.
 *
 * @see https://vercel.com/eve
 */
export default defineAgent({
  model: "openai/gpt-4o-mini",
});

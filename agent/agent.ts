import { defineAgent } from "eve";

/**
 * StudyBuddy eve agent configuration.
 *
 * Deploy with `eve start` locally or `vercel deploy` on Vercel.
 * The web app falls back to /api/chat when EVE_AGENT_URL is not set.
 *
 * @see https://eve.dev/docs/agent-config
 */
export default defineAgent({
  model: "openai/gpt-4o-mini",
});

import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchStudySetContext } from "../lib/study-context.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";

export default defineTool({
  description:
    "Fetch the active study set context including source text, summary, flashcards, quiz questions, and recent chat messages.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  async execute({ studySetId, userId }) {
    try {
      return await withAppSpan(
        "agent.getStudySetContext",
        "db.query",
        { feature: "chat", studySetId, userId, agentTool: "getStudySetContext" },
        () => fetchStudySetContext(studySetId, userId)
      );
    } catch (error) {
      captureAppError(error, {
        feature: "chat",
        userId,
        studySetId,
        tool: "getStudySetContext",
      });
      return { error: "Failed to load study set context" };
    }
  },
});

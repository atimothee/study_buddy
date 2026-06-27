import { defineTool } from "eve/tools";
import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "../lib/ai.js";
import {
  fetchStudySetContext,
  formatStudyContextForPrompt,
} from "../lib/study-context.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";

const practiceSchema = z.object({
  question: z.string(),
  answer: z.string(),
  explanation: z.string(),
  sourceGrounding: z.string(),
});

export default defineTool({
  description:
    "Generate one practice question grounded in the active study set, with answer, explanation, and source grounding.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    topic: z.string().optional(),
    weakArea: z.string().optional(),
  }),
  async execute({ studySetId, userId, topic, weakArea }) {
    try {
      const context = await withAppSpan(
        "agent.generatePracticeQuestion.context",
        "db.query",
        { feature: "quiz", studySetId, userId },
        () => fetchStudySetContext(studySetId, userId)
      );

      if ("error" in context) {
        return context;
      }

      const contextText = formatStudyContextForPrompt(context);
      const focus = [topic, weakArea].filter(Boolean).join("; ");

      const { object } = await withAppSpan(
        "agent.generatePracticeQuestion.llm",
        "ai.generation",
        { feature: "quiz", studySetId, userId },
        () =>
          generateObject({
            model: openai("gpt-4o-mini"),
            schema: practiceSchema,
            system:
              "Generate one practice question grounded ONLY in the provided study material. Do not invent facts.",
            prompt: `${contextText}\n\nFocus: ${focus || "general review"}\n\nReturn one question with answer, explanation, and a short sourceGrounding quote from the material.`,
          })
      );

      return object;
    } catch (error) {
      captureAppError(error, {
        feature: "quiz",
        userId,
        studySetId,
        tool: "generatePracticeQuestion",
      });
      return { error: "Failed to generate practice question" };
    }
  },
});

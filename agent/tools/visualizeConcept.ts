import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  fetchStudySetContext,
  findConceptGrounding,
} from "../lib/study-context.js";
import { buildVisualizationResult } from "../lib/visualization.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";
import { extractConceptFromMessage } from "../../src/lib/concept-grounding.js";

export default defineTool({
  description:
    "Create a grounded Xiaohei-style visual explanation for one concept from the active study set using the ian-xiaohei-illustrations-en skill.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    concept: z.string().min(1),
    userInstruction: z.string().optional(),
  }),
  async execute({ studySetId, userId, concept, userInstruction }, ctx) {
    const normalizedConcept = extractConceptFromMessage(concept);

    try {
      const context = await withAppSpan(
        "agent.visualizeConcept.context",
        "db.query",
        { feature: "visualization", studySetId, userId },
        () => fetchStudySetContext(studySetId, userId)
      );

      if ("error" in context) {
        return context;
      }

      const grounding = findConceptGrounding(context, normalizedConcept);
      if (!grounding) {
        return { error: "I don't see that in your study material." };
      }

      try {
        const skill = ctx.getSkill("ian-xiaohei-illustrations-en");
        const checklist = await skill
          .file("references/qa-checklist.md")
          .text()
          .catch(() => "");

        const result = await withAppSpan(
          "agent.visualizeConcept.build",
          "visualization.generation",
          {
            feature: "visualization",
            studySetId,
            userId,
            conceptLength: normalizedConcept.length,
          },
          () =>
            buildVisualizationResult(
              context,
              normalizedConcept,
              userInstruction,
              grounding
            )
        );

        if ("error" in result) {
          return result;
        }

        return {
          ...result,
          skillLoaded: skill.name,
          qaChecklistExcerpt: checklist.slice(0, 400),
        };
      } catch {
        return withAppSpan(
          "agent.visualizeConcept.fallback",
          "visualization.generation",
          { feature: "visualization", studySetId, userId },
          () =>
            buildVisualizationResult(
              context,
              normalizedConcept,
              userInstruction,
              grounding
            )
        );
      }
    } catch (error) {
      captureAppError(error, {
        feature: "visualization",
        userId,
        studySetId,
        tool: "visualizeConcept",
        extra: { conceptLength: normalizedConcept.length },
      });
      return { error: "Failed to create visual explanation" };
    }
  },
});

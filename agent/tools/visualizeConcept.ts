import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  fetchStudySetContext,
  findConceptGrounding,
} from "../lib/study-context.js";
import { buildVisualizationResult } from "../lib/visualization.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";
import {
  extractConceptFromMessage,
  extractSearchTerms,
  isVagueVisualRequest,
  VISUAL_CLARIFY_MESSAGE,
} from "../../src/lib/concept-grounding.js";
import {
  loadXiaoheiSkillRefs,
  XIAOHEI_SKILL_ID,
  type XiaoheiSkillRefs,
} from "../../src/lib/xiaohei-skill.js";

async function loadSkillRefsFromContext(
  ctx: { getSkill: (name: string) => { file: (path: string) => { text: () => Promise<string> } } }
): Promise<XiaoheiSkillRefs> {
  try {
    const skill = ctx.getSkill(XIAOHEI_SKILL_ID);
    const [skillMd, promptTemplate, styleDna, xiaoheiIp, compositionPatterns, qaChecklist] =
      await Promise.all([
        skill.file("SKILL.md").text().catch(() => ""),
        skill.file("references/prompt-template.md").text().catch(() => ""),
        skill.file("references/style-dna.md").text().catch(() => ""),
        skill.file("references/xiaohei-ip.md").text().catch(() => ""),
        skill.file("references/composition-patterns.md").text().catch(() => ""),
        skill.file("references/qa-checklist.md").text().catch(() => ""),
      ]);
    return { skillMd, promptTemplate, styleDna, xiaoheiIp, compositionPatterns, qaChecklist };
  } catch {
    return loadXiaoheiSkillRefs();
  }
}

export default defineTool({
  description:
    "Create a grounded Xiaohei-style visual explanation using the ian-xiaohei-illustrations-en skill. Always use this for visualize/draw/illustrate requests.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    concept: z.string().min(1),
    userInstruction: z.string().optional(),
  }),
  async execute({ studySetId, userId, concept, userInstruction }, ctx) {
    const normalizedConcept = extractConceptFromMessage(concept);

    if (
      isVagueVisualRequest(userInstruction ?? concept) &&
      extractSearchTerms(normalizedConcept).length === 0
    ) {
      return { clarify: VISUAL_CLARIFY_MESSAGE };
    }

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

      const skillRefs = await loadSkillRefsFromContext(ctx);

      const result = await withAppSpan(
        "agent.visualizeConcept.build",
        "visualization.generation",
        {
          feature: "visualization",
          studySetId,
          userId,
          conceptLength: normalizedConcept.length,
          skillId: XIAOHEI_SKILL_ID,
        },
        () =>
          buildVisualizationResult(
            {
              studySet: {
                title: context.studySet.title,
                summary: context.studySet.summary,
                sourceText: context.studySet.sourceText,
              },
              flashcards: context.flashcards,
              quizQuestions: context.quizQuestions.map((q) => ({
                question: q.question,
                explanation: q.explanation,
                correctAnswer: q.correctAnswer,
              })),
            },
            normalizedConcept,
            userInstruction,
            grounding,
            skillRefs
          )
      );

      if ("error" in result) {
        return result;
      }

      return result;
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

import { defineTool } from "eve/tools";
import { z } from "zod";
import { createServiceClient } from "../../src/lib/supabase/admin";
import {
  saveStudyArtifactsToDb,
  verifyStudySetOwnership,
} from "../../src/lib/study-artifacts/save";
import { studyArtifactsSchema } from "../../src/lib/study-artifacts/schemas";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";

export default defineTool({
  description:
    "Save generated study artifacts (summary, flashcards, quiz) to Supabase for a study set.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    artifacts: studyArtifactsSchema,
  }),
  outputSchema: z.union([
    z.object({
      success: z.literal(true),
      summarySaved: z.boolean(),
      flashcardCount: z.number(),
      quizQuestionCount: z.number(),
    }),
    z.object({ success: z.literal(false), error: z.string() }),
  ]),
  async execute({ studySetId, userId, artifacts }) {
    const supabase = createServiceClient();

    const ownership = await withAppSpan(
      "agent.saveStudyArtifacts.verify",
      "db.query",
      { feature: "study_generation", studySetId, userId },
      () => verifyStudySetOwnership(supabase, studySetId, userId)
    );

    if (!ownership.ok) {
      return { success: false as const, error: ownership.error };
    }

    try {
      const result = await withAppSpan(
        "agent.saveStudyArtifacts",
        "db.query",
        {
          feature: "study_generation",
          studySetId,
          userId,
          flashcardCount: artifacts.flashcards.length,
          quizQuestionCount: artifacts.quiz.questions.length,
        },
        () => saveStudyArtifactsToDb(supabase, studySetId, artifacts)
      );
      return result;
    } catch (err) {
      captureAppError(err, {
        feature: "study_generation",
        userId,
        studySetId,
        tool: "saveStudyArtifacts",
        extra: {
          flashcardCount: artifacts.flashcards.length,
          quizQuestionCount: artifacts.quiz.questions.length,
        },
      });
      return {
        success: false as const,
        error: "Failed to save study materials",
      };
    }
  },
});

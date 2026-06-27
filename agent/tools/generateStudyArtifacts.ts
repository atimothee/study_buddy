import { defineTool } from "eve/tools";
import { z } from "zod";
import { createServiceClient } from "../../src/lib/supabase/admin";
import {
  generateStudyArtifactsFromSource,
  isSourceTextTooShort,
} from "../../src/lib/study-artifacts/generate";
import {
  generateStudyArtifactsOptionsSchema,
  studyArtifactsSchema,
} from "../../src/lib/study-artifacts/schemas";
import {
  bucketSourceLength,
  captureAppError,
  withAppSpan,
} from "../../src/lib/sentry.js";

export default defineTool({
  description:
    "Generate a summary, flashcards, and quiz questions from a study set's source material.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    options: generateStudyArtifactsOptionsSchema.optional(),
  }),
  outputSchema: z.union([
    studyArtifactsSchema,
    z.object({ error: z.string() }),
  ]),
  async execute({ studySetId, userId, options }) {
    const supabase = createServiceClient();

    try {
      const { data: studySet } = await supabase
        .from("study_sets")
        .select("id, source_text")
        .eq("id", studySetId)
        .eq("user_id", userId)
        .single();

      if (!studySet) {
        return { error: "Study set not found" };
      }

      const sourceLengthBucket = bucketSourceLength(
        studySet.source_text?.length ?? 0
      );

      if (isSourceTextTooShort(studySet.source_text)) {
        return {
          error:
            "Source material is too short. Please add at least 100 characters of study material before generating.",
        };
      }

      const artifacts = await withAppSpan(
        "agent.generateStudyArtifacts.llm",
        "ai.generation",
        { feature: "study_generation", studySetId, userId, sourceLengthBucket },
        () => generateStudyArtifactsFromSource(studySet.source_text!, options)
      );

      return artifacts;
    } catch (err) {
      captureAppError(err, {
        feature: "study_generation",
        userId,
        studySetId,
        tool: "generateStudyArtifacts",
      });
      return {
        error:
          "Failed to generate study materials. The source may be too unclear to process.",
      };
    }
  },
});

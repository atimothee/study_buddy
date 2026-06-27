import { createServiceClient } from "@/lib/supabase/admin";
import {
  generateStudyArtifactsFromSource,
  isSourceTextTooShort,
} from "@/lib/study-artifacts/generate";
import {
  saveStudyArtifactsToDb,
  verifyStudySetOwnership,
  type SaveStudyArtifactsResult,
} from "@/lib/study-artifacts/save";
import type { GenerateStudyArtifactsOptions } from "@/lib/study-artifacts/schemas";
import { captureAppError, withAppSpan } from "@/lib/sentry";
import { createAuthenticatedEveClient } from "@/lib/eve/client";
import { z } from "zod";

const eveResultSchema = z.object({
  success: z.literal(true),
  summarySaved: z.boolean(),
  flashcardCount: z.number(),
  quizQuestionCount: z.number(),
});

const useEveGeneration = process.env.EVE_GENERATION_ENABLED === "true";

async function isEveAvailable(
  userId: string,
  accessToken?: string | null
): Promise<boolean> {
  if (!useEveGeneration) return false;

  try {
    const client = await createAuthenticatedEveClient(userId, accessToken);
    const health = await client.health();
    return health.ok === true;
  } catch {
    return false;
  }
}

async function generateViaEveAgent(
  studySetId: string,
  userId: string,
  accessToken: string | null | undefined,
  options?: GenerateStudyArtifactsOptions
): Promise<SaveStudyArtifactsResult> {
  return withAppSpan(
    "eve.studyGeneration",
    "agent.execution",
    { feature: "study_generation", studySetId, userId },
    async () => {
      const client = await createAuthenticatedEveClient(userId, accessToken);
      const session = client.session();

      const response = await session.send({
        message: [
          "Generate complete study materials for the study set in clientContext.",
          "Steps:",
          "1. Call generateStudyArtifacts with studySetId and userId from clientContext.",
          "2. If generation succeeds, call saveStudyArtifacts with the same ids and the generated artifacts.",
          "3. Return the save result counts.",
        ].join("\n"),
        clientContext: {
          studySetId,
          userId,
          task: "generateStudyMaterials",
          ...(options ?? {}),
        },
        outputSchema: eveResultSchema,
      });

      const result = await response.result();
      return eveResultSchema.parse(result);
    }
  );
}

async function generateViaSharedTools(
  studySetId: string,
  userId: string,
  options?: GenerateStudyArtifactsOptions
): Promise<SaveStudyArtifactsResult> {
  const supabase = createServiceClient();

  const ownership = await withAppSpan(
    "study_generation.verifyOwnership",
    "db.query",
    { feature: "study_generation", studySetId, userId },
    () => verifyStudySetOwnership(supabase, studySetId, userId)
  );

  if (!ownership.ok) {
    throw new Error(ownership.error);
  }

  const { data: studySet } = await withAppSpan(
    "study_generation.fetchSource",
    "db.query",
    { feature: "study_generation", studySetId, userId },
    () =>
      supabase
        .from("study_sets")
        .select("source_text")
        .eq("id", studySetId)
        .eq("user_id", userId)
        .single()
  );

  if (!studySet || isSourceTextTooShort(studySet.source_text)) {
    throw new Error(
      "Please add at least 100 characters of source material before generating."
    );
  }

  const artifacts = await generateStudyArtifactsFromSource(
    studySet.source_text!,
    options
  );

  return withAppSpan(
    "study_generation.saveArtifacts",
    "db.query",
    { feature: "study_generation", studySetId, userId },
    () => saveStudyArtifactsToDb(supabase, studySetId, artifacts)
  );
}

export async function runStudyGeneration(
  studySetId: string,
  userId: string,
  options?: GenerateStudyArtifactsOptions,
  accessToken?: string | null
): Promise<SaveStudyArtifactsResult> {
  if (await isEveAvailable(userId, accessToken)) {
    try {
      return await generateViaEveAgent(
        studySetId,
        userId,
        accessToken,
        options
      );
    } catch (err) {
      captureAppError(err, {
        feature: "study_generation",
        userId,
        studySetId,
        tool: "eveStudyGeneration",
        extra: { fallback: true },
      });
    }
  }

  return generateViaSharedTools(studySetId, userId, options);
}

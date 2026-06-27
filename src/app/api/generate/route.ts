import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContentSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { runStudyGeneration } from "@/lib/eve/run-study-generation";
import { sendStudySetReadyEmail } from "@/lib/email";
import { isSourceTextTooShort } from "@/lib/study-artifacts/generate";
import { extractAiErrorDetails } from "@/lib/ai/error-details";
import { bucketSourceLength, captureAppError, withAppSpan } from "@/lib/sentry";

function clientSafeGenerationError(err: unknown): string {
  const fallback =
    "We could not generate your study materials. Please try again.";
  if (!(err instanceof Error)) return fallback;

  const message = err.message.trim();
  if (!message) return fallback;

  if (
    /unauthorized|invalid study set|rate limit|at least 100 characters|not found/i.test(
      message
    )
  ) {
    return message;
  }

  if (/ai generation is not configured|api_key|openai_api_key|ai_gateway/i.test(message)) {
    return message;
  }

  return fallback;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`generate:${user.id}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rateLimit.retryAfter}s.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = generateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid study set ID" }, { status: 400 });
  }

  const { studySetId } = parsed.data;
  let sourceLengthBucket: string | undefined;

  try {
    const { data: studySet, error: fetchError } = await withAppSpan(
      "supabase.study_sets.fetch",
      "db.query",
      { feature: "study_generation", studySetId, userId: user.id },
      () =>
        supabase
          .from("study_sets")
          .select("title, source_text")
          .eq("id", studySetId)
          .eq("user_id", user.id)
          .single()
    );

    if (fetchError || !studySet) {
      return NextResponse.json({ error: "Study set not found" }, { status: 404 });
    }

    sourceLengthBucket = bucketSourceLength(
      studySet.source_text?.length ?? 0
    );

    if (isSourceTextTooShort(studySet.source_text)) {
      return NextResponse.json(
        { error: "Please add at least 100 characters of source material" },
        { status: 400 }
      );
    }

    const saved = await withAppSpan(
      "study_generation.run",
      "study.generation",
      {
        feature: "study_generation",
        studySetId,
        userId: user.id,
        sourceLengthBucket,
      },
      async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        return runStudyGeneration(
          studySetId,
          user.id,
          undefined,
          session?.access_token ?? null
        );
      }
    );

    if (user.email) {
      await sendStudySetReadyEmail(
        user.email,
        studySet.title,
        studySetId
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, saved });
  } catch (err) {
    const aiErrorDetails = extractAiErrorDetails(err);
    captureAppError(err, {
      feature: "study_generation",
      userId: user.id,
      studySetId,
      tool: "runStudyGeneration",
      extra: {
        ...(sourceLengthBucket ? { sourceLengthBucket } : {}),
        ...aiErrorDetails,
      },
    });

    if (aiErrorDetails.errorCode === "invalid_json_schema") {
      console.error("[api/generate] invalid_json_schema", {
        studySetId,
        userId: user.id,
        ...aiErrorDetails,
      });
    }
    return NextResponse.json(
      { error: clientSafeGenerationError(err) },
      { status: 500 }
    );
  }
}

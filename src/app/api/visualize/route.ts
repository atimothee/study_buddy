import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { visualizeConceptSchema } from "@/lib/validations";
import { runVisualizeConcept } from "@/lib/visualize-concept";
import { buildFallbackVisualization } from "@/lib/visualization-fallback";
import { captureAppError, withAppSpan } from "@/lib/sentry";

export const maxDuration = 60;

export async function POST(request: Request) {
  let studySetId: string | undefined;
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;

    const rateLimit = checkRateLimit(`visualize:${user.id}`);
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

    const parsed = visualizeConceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid visualization request" }, {
        status: 400,
      });
    }

    studySetId = parsed.data.studySetId;

    const result = await withAppSpan(
      "visualize.runVisualizeConcept",
      "visualization.generation",
      { feature: "visualization", studySetId, userId },
      () =>
        runVisualizeConcept({
          studySetId: parsed.data.studySetId,
          userId: user.id,
          message: parsed.data.userInstruction ?? parsed.data.concept,
          conceptOverride: parsed.data.conceptOverride,
          recentMessages: parsed.data.recentMessages,
        })
    );

    if (result.status === "visual") {
      return NextResponse.json({ type: "visual", visual: result.visual });
    }

    if (result.status === "clarify") {
      return NextResponse.json({ type: "clarify", message: result.message });
    }

    return NextResponse.json(
      { type: "error", message: result.message },
      { status: 404 }
    );
  } catch (error) {
    captureAppError(error, {
      feature: "visualization",
      userId,
      studySetId,
      tool: "visualizeRoute",
    });
    return NextResponse.json(
      {
        type: "visual",
        visual: buildFallbackVisualization(
          "Study concept",
          "your study set",
          "Visual explanation fallback."
        ),
      },
      { status: 200 }
    );
  }
}

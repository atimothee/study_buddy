import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { visualizeConceptSchema } from "@/lib/validations";
import {
  extractConceptFromMessage,
  resolveVisualizationConcept,
} from "@/lib/concept-grounding";
import { buildVisualizationResult } from "@/lib/visualization-build";
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
    const userInstruction = parsed.data.userInstruction;

    const { data: studySet, error: fetchError } = await withAppSpan(
      "visualize.fetchStudySet",
      "db.query",
      { feature: "visualization", studySetId, userId },
      () =>
        supabase
          .from("study_sets")
          .select("id, title, summary, source_text")
          .eq("id", studySetId!)
          .eq("user_id", userId!)
          .single()
    );

    if (fetchError || !studySet) {
      return NextResponse.json({ error: "Study set not found" }, { status: 404 });
    }

    const concept = resolveVisualizationConcept(
      parsed.data.userInstruction ?? parsed.data.concept,
      studySet
    );

    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("front, back")
      .eq("study_set_id", studySetId);

    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id")
      .eq("study_set_id", studySetId)
      .limit(1);

    let quizQuestions: Array<{
      question: string;
      explanation?: string;
      correctAnswer: string;
    }> = [];

    if (quizzes?.[0]) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("question, explanation, correct_answer")
        .eq("quiz_id", quizzes[0].id);

      quizQuestions = (questions ?? []).map((question) => ({
        question: question.question,
        explanation: question.explanation ?? undefined,
        correctAnswer: question.correct_answer,
      }));
    }

    const result = await withAppSpan(
      "visualize.build",
      "visualization.generation",
      { feature: "visualization", studySetId, userId, conceptLength: concept.length },
      () =>
        buildVisualizationResult(
          {
            studySet: {
              title: studySet.title,
              summary: studySet.summary ?? undefined,
              sourceText: studySet.source_text ?? "",
            },
            flashcards: flashcards ?? [],
            quizQuestions,
          },
          concept,
          userInstruction
        )
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ visual: result });
  } catch (error) {
    captureAppError(error, {
      feature: "visualization",
      userId,
      studySetId,
      tool: "visualizeRoute",
    });
    return NextResponse.json(
      { error: "Failed to create visual explanation" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContentSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateStudyContent } from "@/lib/ai/generation";
import { sendStudySetReadyEmail } from "@/lib/email";

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

  const { data: studySet, error: fetchError } = await supabase
    .from("study_sets")
    .select("*")
    .eq("id", studySetId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !studySet) {
    return NextResponse.json({ error: "Study set not found" }, { status: 404 });
  }

  if (!studySet.source_text || studySet.source_text.length < 100) {
    return NextResponse.json(
      { error: "Please add at least 100 characters of source material" },
      { status: 400 }
    );
  }

  try {
    const generated = await generateStudyContent(studySet.source_text);

    await supabase
      .from("study_sets")
      .update({
        summary: generated.summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studySetId);

    await supabase.from("flashcards").delete().eq("study_set_id", studySetId);

    if (generated.flashcards.length > 0) {
      await supabase.from("flashcards").insert(
        generated.flashcards.map((card) => ({
          study_set_id: studySetId,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty,
        }))
      );
    }

    const { data: existingQuiz } = await supabase
      .from("quizzes")
      .select("id")
      .eq("study_set_id", studySetId)
      .maybeSingle();

    let quizId = existingQuiz?.id;

    if (quizId) {
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
      await supabase
        .from("quizzes")
        .update({ title: generated.quiz.title })
        .eq("id", quizId);
    } else {
      const { data: newQuiz } = await supabase
        .from("quizzes")
        .insert({
          study_set_id: studySetId,
          title: generated.quiz.title,
        })
        .select("id")
        .single();
      quizId = newQuiz?.id;
    }

    if (quizId && generated.quiz.questions.length > 0) {
      await supabase.from("quiz_questions").insert(
        generated.quiz.questions.map((q) => ({
          quiz_id: quizId,
          question: q.question,
          choices: q.choices,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }))
      );
    }

    if (user.email) {
      await sendStudySetReadyEmail(
        user.email,
        studySet.title,
        studySetId
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, generated });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate study materials" },
      { status: 500 }
    );
  }
}

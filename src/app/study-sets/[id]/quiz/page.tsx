import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { QuizRunner } from "@/components/QuizRunner";
import { EmptyState } from "@/components/EmptyState";
import { GenerateButton } from "@/components/GenerateButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("title, source_text")
    .eq("id", id)
    .single();

  if (!studySet) notFound();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("study_set_id", id)
    .maybeSingle();

  let questions: Array<{
    id: string;
    quiz_id: string;
    question: string;
    choices: string[];
    correct_answer: string;
    explanation: string | null;
    created_at: string;
  }> = [];

  if (quiz) {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("created_at");

    questions = (data ?? []).map((q) => ({
      ...q,
      choices: q.choices as string[],
    }));
  }

  return (
    <AppShell studySetId={id} studySetTitle={studySet.title}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Quiz</h1>

        {questions.length === 0 ? (
          <div className="space-y-6">
            <EmptyState
              title="No quiz questions yet"
              description="Generate a quiz from your study material to test your understanding."
            />
            <GenerateButton
              studySetId={id}
              hasContent={(studySet.source_text?.length ?? 0) >= 100}
            />
          </div>
        ) : (
          <QuizRunner questions={questions} quizTitle={quiz?.title} />
        )}
      </div>
    </AppShell>
  );
}

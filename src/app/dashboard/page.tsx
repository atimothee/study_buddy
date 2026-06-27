import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { StudySetCard } from "@/components/StudySetCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: studySets } = await supabase
    .from("study_sets")
    .select("*")
    .order("created_at", { ascending: false });

  const setsWithCounts = await Promise.all(
    (studySets ?? []).map(async (set) => {
      const { count: flashcardCount } = await supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("study_set_id", set.id);

      const { data: quiz } = await supabase
        .from("quizzes")
        .select("id")
        .eq("study_set_id", set.id)
        .maybeSingle();

      let quizQuestionCount = 0;
      if (quiz) {
        const { count } = await supabase
          .from("quiz_questions")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", quiz.id);
        quizQuestionCount = count ?? 0;
      }

      return {
        set,
        flashcardCount: flashcardCount ?? 0,
        quizQuestionCount,
      };
    })
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </p>
          </div>
          <Button asChild>
            <Link href="/study-sets/new">
              <Plus className="h-4 w-4" />
              New Study Set
            </Link>
          </Button>
        </div>

        {setsWithCounts.length === 0 ? (
          <EmptyState
            title="No study sets yet"
            description="Create your first study set by pasting notes or uploading a file. We'll generate flashcards, a quiz, and a summary."
            actionLabel="Create study set"
            actionHref="/study-sets/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {setsWithCounts.map(({ set, flashcardCount, quizQuestionCount }) => (
              <StudySetCard
                key={set.id}
                studySet={set}
                flashcardCount={flashcardCount}
                quizQuestionCount={quizQuestionCount}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

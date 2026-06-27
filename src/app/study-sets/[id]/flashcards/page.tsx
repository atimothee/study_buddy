import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { EmptyState } from "@/components/EmptyState";
import { GenerateButton } from "@/components/GenerateButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("title, source_text")
    .eq("id", id)
    .single();

  if (!studySet) notFound();

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("study_set_id", id)
    .order("created_at");

  return (
    <AppShell studySetId={id} studySetTitle={studySet.title}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Flashcards</h1>

        {!flashcards?.length ? (
          <div className="space-y-6">
            <EmptyState
              title="No flashcards yet"
              description="Generate flashcards from your study material to start practicing."
            />
            <GenerateButton
              studySetId={id}
              hasContent={(studySet.source_text?.length ?? 0) >= 100}
            />
          </div>
        ) : (
          <FlashcardViewer cards={flashcards} />
        )}
      </div>
    </AppShell>
  );
}

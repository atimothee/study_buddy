import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, HelpCircle, MessageSquare, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteStudySet } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudySetPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("*")
    .eq("id", id)
    .single();

  if (!studySet) notFound();

  const { count: flashcardCount } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("study_set_id", id);

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("study_set_id", id)
    .maybeSingle();

  let quizQuestionCount = 0;
  if (quiz) {
    const { count } = await supabase
      .from("quiz_questions")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quiz.id);
    quizQuestionCount = count ?? 0;
  }

  const hasGenerated = (flashcardCount ?? 0) > 0 || quizQuestionCount > 0;

  return (
    <AppShell studySetId={id} studySetTitle={studySet.title}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {studySet.title}
              </h1>
              {studySet.subject && (
                <Badge variant="secondary">{studySet.subject}</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Created {new Date(studySet.created_at).toLocaleDateString()}
            </p>
          </div>
          <form action={deleteStudySet.bind(null, id)}>
            <Button type="submit" variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>

        {!hasGenerated && (
          <Card>
            <CardHeader>
              <CardTitle>Generate study materials</CardTitle>
              <CardDescription>
                We&apos;ll create flashcards, a quiz, and a summary from your
                source material.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateButton
                studySetId={id}
                hasContent={(studySet.source_text?.length ?? 0) >= 100}
              />
            </CardContent>
          </Card>
        )}

        {studySet.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {studySet.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {hasGenerated && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href={`/study-sets/${id}/flashcards`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <Layers className="h-8 w-8 text-indigo-600" />
                  <p className="font-semibold">Flashcards</p>
                  <p className="text-sm text-slate-500">
                    {flashcardCount} cards
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/study-sets/${id}/quiz`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <HelpCircle className="h-8 w-8 text-indigo-600" />
                  <p className="font-semibold">Quiz</p>
                  <p className="text-sm text-slate-500">
                    {quizQuestionCount} questions
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/study-sets/${id}/chat`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-indigo-600" />
                  <p className="font-semibold">Chat</p>
                  <p className="text-sm text-slate-500">Ask StudyBuddy</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {hasGenerated && (
          <Card>
            <CardHeader>
              <CardTitle>Regenerate study materials</CardTitle>
              <CardDescription>
                Generate new flashcards and quiz questions from your source
                material. This replaces existing content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateButton
                studySetId={id}
                hasContent={(studySet.source_text?.length ?? 0) >= 100}
                label="Regenerate study materials"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

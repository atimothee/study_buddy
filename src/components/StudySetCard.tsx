import Link from "next/link";
import { BookOpen, Layers, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudySet } from "@/lib/types";

interface StudySetCardProps {
  studySet: StudySet;
  flashcardCount?: number;
  quizQuestionCount?: number;
}

export function StudySetCard({
  studySet,
  flashcardCount = 0,
  quizQuestionCount = 0,
}: StudySetCardProps) {
  const created = new Date(studySet.created_at).toLocaleDateString();

  return (
    <Link href={`/study-sets/${studySet.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{studySet.title}</CardTitle>
            {studySet.subject && <Badge variant="secondary">{studySet.subject}</Badge>}
          </div>
          <CardDescription>Created {created}</CardDescription>
        </CardHeader>
        <CardContent>
          {studySet.summary ? (
            <p className="line-clamp-2 text-sm text-slate-600">{studySet.summary}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">No summary yet</p>
          )}
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {flashcardCount} cards
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              {quizQuestionCount} questions
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Study
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

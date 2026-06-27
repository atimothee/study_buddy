import Link from "next/link";
import {
  BookOpen,
  Layers,
  MessageSquare,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Layers,
    title: "Smart flashcards",
    description:
      "Generate 10–20 atomic flashcards from your notes for active recall practice.",
  },
  {
    icon: HelpCircle,
    title: "Instant quizzes",
    description:
      "Test your understanding with multiple-choice questions and detailed explanations.",
  },
  {
    icon: MessageSquare,
    title: "Study chat",
    description:
      "Chat with StudyBuddy — grounded in your material, ready to quiz and explain.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">StudyBuddy</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Start studying</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" />
            NotebookLM-inspired study app
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Turn your notes into flashcards, quizzes, and a study assistant
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Upload or paste your study material and let StudyBuddy generate
            personalized flashcards, quizzes, and a chat tutor — all grounded in
            your content.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login">Start studying free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Create an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-20 rounded-2xl bg-indigo-600 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to study smarter?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-indigo-100">
            Paste your lecture notes, textbook excerpts, or study guides — we&apos;ll
            handle the rest.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6 bg-white text-indigo-700 hover:bg-indigo-50"
            asChild
          >
            <Link href="/login">Get started</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        StudyBuddy — built for students who want to learn, not just read.
      </footer>
    </div>
  );
}

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
    title: "Source-grounded chat",
    description:
      "Ask questions, get explanations, and practice with a study assistant grounded in your sources.",
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
            AI-powered study workspace
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Study smarter with your own AI study companion
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Paste or upload your notes, readings, or course material. StudyBuddy
            turns them into flashcards, quizzes, summaries, and a chat assistant
            grounded in your sources.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login">Start studying</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
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
            Upload or paste course material and generate study tools instantly.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6 bg-white text-indigo-700 hover:bg-indigo-50"
            asChild
          >
            <Link href="/login">Start studying</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        StudyBuddy — a personal study companion for active recall and practice.
      </footer>
    </div>
  );
}

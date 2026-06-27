"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

interface QuizRunnerProps {
  questions: QuizQuestion[];
  quizTitle?: string | null;
}

interface AnswerRecord {
  questionId: string;
  selected: string;
  correct: boolean;
}

export function QuizRunner({ questions, quizTitle }: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  function handleSubmit() {
    if (!selected || !current) return;

    const correct = selected === current.correct_answer;
    setAnswers((prev) => [
      ...prev,
      { questionId: current.id, selected, correct },
    ]);
    setSubmitted(true);
  }

  function handleNext() {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  }

  if (finished) {
    const score = answers.filter((a) => a.correct).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz complete!</CardTitle>
            <p className="text-slate-500">
              You scored {score} out of {questions.length} ({percentage}%)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, i) => {
              const answer = answers[i];
              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-lg border p-4",
                    answer?.correct
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {answer?.correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{q.question}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Your answer: {answer?.selected}
                      </p>
                      {!answer?.correct && (
                        <p className="text-sm text-emerald-700">
                          Correct: {q.correct_answer}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="mt-2 text-sm text-slate-500">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              className="w-full"
              onClick={() => {
                setIndex(0);
                setSelected(null);
                setSubmitted(false);
                setAnswers([]);
                setFinished(false);
              }}
            >
              Retake quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{quizTitle ?? "Quiz"}</h2>
          <p className="text-sm text-slate-500">
            Question {index + 1} of {questions.length}
          </p>
        </div>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {current.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {current.choices.map((choice) => {
            const isSelected = selected === choice;
            const isCorrect = choice === current.correct_answer;
            let style = "border-slate-200 hover:border-indigo-300";

            if (submitted) {
              if (isCorrect) style = "border-emerald-500 bg-emerald-50";
              else if (isSelected) style = "border-red-500 bg-red-50";
            } else if (isSelected) {
              style = "border-indigo-500 bg-indigo-50";
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(choice)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left text-sm transition-colors",
                  style
                )}
              >
                {choice}
              </button>
            );
          })}

          {submitted && current.explanation && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              {current.explanation}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={!selected}>
                Submit answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {index === questions.length - 1 ? "See results" : "Next question"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const GENERATION_STEPS = [
  { id: "reading", label: "Reading source material" },
  { id: "summary", label: "Creating summary" },
  { id: "flashcards", label: "Generating cloze flashcards" },
  { id: "quiz", label: "Building quiz" },
  { id: "chat", label: "Preparing study chat" },
] as const;

interface GenerationProgressProps {
  activeStep: number;
  complete?: boolean;
}

export function GenerationProgress({
  activeStep,
  complete = false,
}: GenerationProgressProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
      <p className="text-center text-sm font-medium text-slate-700">
        {complete ? "Study materials ready!" : "Generating your study materials…"}
      </p>
      <ol className="space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isDone = complete || index < activeStep;
          const isActive = !complete && index === activeStep;

          return (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && "border-indigo-500 bg-white text-indigo-600",
                  !isDone && !isActive && "border-slate-200 bg-white text-slate-300"
                )}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <span
                className={cn(
                  isDone && "text-slate-700",
                  isActive && "font-medium text-indigo-700",
                  !isDone && !isActive && "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface FlashcardViewerProps {
  cards: Flashcard[];
}

export function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [order, setOrder] = useState(cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, string>>({});

  const current = cards[order[index]];
  const progress = ((index + 1) / cards.length) * 100;

  function goNext() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  function shuffle() {
    const shuffled = [...order];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrder(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  const difficultyColor = useMemo(() => {
    switch (current?.difficulty) {
      case "easy":
        return "success";
      case "hard":
        return "warning";
      default:
        return "secondary";
    }
  }, [current?.difficulty]);

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <Badge variant={difficultyColor as "success" | "warning" | "secondary"}>
          {current.difficulty}
        </Badge>
      </div>

      <Progress value={progress} />

      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className={cn(
          "relative mx-auto flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-indigo-100 bg-white p-8 text-center shadow-sm transition-all hover:border-indigo-200 hover:shadow-md",
          flipped && "bg-indigo-50"
        )}
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-500">
          {flipped ? "Answer" : "Question"}
        </p>
        <p className="text-xl font-medium text-slate-900">
          {flipped ? current.back : current.front}
        </p>
        <p className="mt-6 text-xs text-slate-400">Click to flip</p>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-500">Self-rating:</span>
        {(["easy", "medium", "hard"] as const).map((level) => (
          <Button
            key={level}
            size="sm"
            variant={ratings[current.id] === level ? "default" : "outline"}
            onClick={() =>
              setRatings((prev) => ({ ...prev, [current.id]: level }))
            }
          >
            {level}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={goPrev} disabled={index === 0}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" onClick={shuffle}>
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
        <Button
          variant="outline"
          onClick={goNext}
          disabled={index === cards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

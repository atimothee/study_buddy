"use client";

import { type ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CARD_TYPE_LABELS,
  getCardBack,
  getCardFront,
  matchesFilter,
  type FlashcardFilter,
} from "@/lib/flashcards";
import type { CardType, Flashcard } from "@/lib/types";

interface FlashcardViewerProps {
  cards: Flashcard[];
}

const FILTERS: { id: FlashcardFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "cloze", label: "Cloze" },
  { id: "definition", label: "Definition" },
  { id: "compare_contrast", label: "Compare / Contrast" },
  { id: "application", label: "Application" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

function renderClozeBack(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\{\{([^}]+)\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <mark
        key={match.index}
        className="rounded bg-amber-100 px-1 font-semibold text-amber-900"
      >
        {match[1]}
      </mark>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function cardTypeLabel(cardType: CardType | null | undefined): string {
  if (!cardType) return CARD_TYPE_LABELS.basic;
  return CARD_TYPE_LABELS[cardType] ?? cardType;
}

function difficultyVariant(
  difficulty: Flashcard["difficulty"]
): "success" | "warning" | "secondary" {
  switch (difficulty) {
    case "easy":
      return "success";
    case "hard":
      return "warning";
    default:
      return "secondary";
  }
}

export function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [filter, setFilter] = useState<FlashcardFilter>("all");
  const filteredCards = useMemo(
    () => cards.filter((card) => matchesFilter(card, filter)),
    [cards, filter]
  );
  const [order, setOrder] = useState(() => filteredCards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, string>>({});

  const displayCards = useMemo(
    () => order.map((i) => filteredCards[i]).filter(Boolean),
    [order, filteredCards]
  );

  const current = displayCards[index];
  const progress =
    displayCards.length > 0 ? ((index + 1) / displayCards.length) * 100 : 0;

  function resetOrder(nextCards: Flashcard[]) {
    setOrder(nextCards.map((_, i) => i));
    setIndex(0);
    setFlipped(false);
  }

  function applyFilter(nextFilter: FlashcardFilter) {
    setFilter(nextFilter);
    const next = cards.filter((card) => matchesFilter(card, nextFilter));
    resetOrder(next);
  }

  function goNext() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, displayCards.length - 1));
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

  if (cards.length === 0) return null;

  if (filteredCards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <FilterBar filter={filter} onFilter={applyFilter} />
        <p className="text-center text-sm text-slate-500">
          No cards match this filter.
        </p>
      </div>
    );
  }

  if (!current) return null;

  const cardType = current.card_type ?? "basic";
  const isCloze = cardType === "cloze" && Boolean(current.cloze_text);
  const frontText = getCardFront(current);
  const backText = getCardBack(current);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <FilterBar filter={filter} onFilter={applyFilter} />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Card {index + 1} of {displayCards.length}
          {filter !== "all" && (
            <span className="text-slate-400"> ({cards.length} total)</span>
          )}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default">{cardTypeLabel(cardType)}</Badge>
          <Badge variant={difficultyVariant(current.difficulty)}>
            {current.difficulty}
          </Badge>
        </div>
      </div>

      {current.tags && current.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {current.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      )}

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
          {flipped ? "Answer" : isCloze ? "Fill in the blank" : "Question"}
        </p>
        <p className="text-xl font-medium leading-relaxed text-slate-900">
          {flipped && isCloze && current.cloze_text
            ? renderClozeBack(current.cloze_text)
            : flipped
              ? backText
              : frontText}
        </p>
        {flipped && current.explanation && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
            {current.explanation}
          </p>
        )}
        {flipped && current.source_quote && (
          <p className="mt-3 max-w-md border-t border-indigo-100 pt-3 text-xs italic text-slate-500">
            &ldquo;{current.source_quote}&rdquo;
          </p>
        )}
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
          disabled={index === displayCards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FilterBar({
  filter,
  onFilter,
}: {
  filter: FlashcardFilter;
  onFilter: (filter: FlashcardFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant={filter === id ? "default" : "outline"}
          onClick={() => onFilter(id)}
          className="text-xs"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

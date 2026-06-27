import type { CardType, Flashcard } from "@/lib/types";

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  basic: "Basic",
  cloze: "Cloze",
  definition: "Definition",
  compare_contrast: "Compare / Contrast",
  application: "Application",
};

export type FlashcardFilter =
  | "all"
  | CardType
  | "easy"
  | "medium"
  | "hard";

const CLOZE_PATTERN = /\{\{([^}]+)\}\}/g;

export function clozeToFront(text: string): string {
  return text.replace(CLOZE_PATTERN, "_____");
}

export function clozeToBack(text: string): string {
  return text.replace(CLOZE_PATTERN, "$1");
}

export function getCardFront(card: Flashcard): string {
  if (card.card_type === "cloze" && card.cloze_text) {
    return clozeToFront(card.cloze_text);
  }
  return card.front;
}

export function getCardBack(card: Flashcard): string {
  if (card.card_type === "cloze" && card.cloze_text) {
    return clozeToBack(card.cloze_text);
  }
  return card.back;
}

export function matchesFilter(card: Flashcard, filter: FlashcardFilter): boolean {
  if (filter === "all") return true;
  if (filter === "easy" || filter === "medium" || filter === "hard") {
    return card.difficulty === filter;
  }
  return card.card_type === filter;
}

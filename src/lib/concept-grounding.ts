import { stripVisualizationMarker } from "@/lib/visualization";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "this",
  "that",
  "these",
  "those",
  "my",
  "me",
  "for",
  "of",
  "to",
  "in",
  "on",
  "with",
  "from",
  "using",
  "please",
  "visualize",
  "visualise",
  "draw",
  "illustrate",
  "illustration",
  "sketch",
  "diagram",
  "explain",
  "show",
  "create",
  "make",
  "turn",
  "into",
  "concept",
  "study",
  "set",
  "material",
  "style",
  "xiaohei",
  "visual",
  "explanation",
  "summary",
  "important",
  "most",
  "would",
  "like",
  "you",
  "can",
  "how",
  "what",
  "about",
  "cartoon",
  "visually",
]);

export const VISUAL_CLARIFY_MESSAGE =
  "Yes. What concept from this study set should I visualize?";

const VAGUE_VISUAL_PATTERN =
  /^(can you )?(please )?(visuali[sz]e|draw|illustrat|sketch|diagram|show(\s+me)?\s+visually)( (it|this|something|a concept|for me))?[?.!]*$/i;

export function isVisualizationRequest(message: string): boolean {
  return (
    /\b(visualize|draw|illustrate|sketch|diagram|xiaohei|cartoon|visual explanation|show visually)\b/i.test(
      message
    ) ||
    /\bshow\s+me\s+visually\b/i.test(message) ||
    VAGUE_VISUAL_PATTERN.test(message.trim())
  );
}

/** @deprecated Use isVisualizationRequest */
export function hasVisualIntent(message: string): boolean {
  return isVisualizationRequest(message) || VAGUE_VISUAL_PATTERN.test(message.trim());
}

export function isVagueVisualRequest(message: string): boolean {
  const extracted = extractConceptFromMessage(message);
  return (
    VAGUE_VISUAL_PATTERN.test(message.trim()) ||
    extractSearchTerms(extracted).length === 0
  );
}

export function extractConceptFromMessage(message: string): string {
  let concept = message.trim();

  const stripPatterns = [
    /^please\s+/i,
    /\b(visuali[sz]e|draw|illustrat|sketch|diagram|show(\s+me)?\s+visually)\s+(me\s+)?/gi,
    /\b(create|make)\s+(a\s+)?(visual|illustration|diagram|xiaohei[- ]style\s+(explanation|illustration|visual))\s+(of|for)\s+/gi,
    /\b(make|create)\s+(a\s+)?xiaohei[- ]style\s+(explanation|illustration|visual)\s+of\s+/gi,
    /\busing\s+the\s+xiaohei\s+illustration\s+style:?\s*/gi,
    /\bfrom\s+my\s+study\s+(set|material)\b/gi,
    /\bthis\s+concept\s+from\s+my\s+study\s+set\b/gi,
    /\bplease\s+visualize\s+this\s+concept\b/gi,
    /\bexplain\s+.*\s+visually\s+/gi,
  ];

  for (const pattern of stripPatterns) {
    concept = concept.replace(pattern, " ");
  }

  concept = concept.replace(/\s+/g, " ").trim();
  return concept;
}

export interface ConceptResolution {
  concept: string | null;
  needsClarification: boolean;
}

export function resolveVisualizationConcept(
  message: string,
  recentMessages: Array<{ role: string; content: string }> = []
): ConceptResolution {
  const extracted = extractConceptFromMessage(message);

  if (!isVagueVisualRequest(message) && extractSearchTerms(extracted).length > 0) {
    return { concept: extracted, needsClarification: false };
  }

  const fromHistory = inferConceptFromRecentMessages(recentMessages);
  if (fromHistory) {
    return { concept: fromHistory, needsClarification: false };
  }

  return { concept: null, needsClarification: true };
}

function inferConceptFromRecentMessages(
  recentMessages: Array<{ role: string; content: string }>
): string | null {
  for (const message of [...recentMessages].reverse()) {
    if (message.role !== "user" && message.role !== "assistant") continue;

    const text = stripVisualizationMarker(message.content).trim();
    if (!text || isVisualizationRequest(text) || isVagueVisualRequest(text)) {
      continue;
    }

    const phrase = extractLikelyConceptPhrase(text);
    if (phrase) return phrase;
  }

  return null;
}

function extractLikelyConceptPhrase(text: string): string | null {
  const patterns = [
    /\b(self-attention|multi-head attention|positional encoding|attention mechanism|transformer architecture|encoder-decoder|feed-forward network|layer normalization)\b/i,
    /\b([A-Za-z][\w-]*(?:\s+[A-Za-z][\w-]*){0,4})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1] && extractSearchTerms(match[1]).length > 0) {
      return match[1].trim();
    }
  }

  const terms = extractSearchTerms(text);
  if (terms.length >= 2) {
    return terms.slice(0, 4).join(" ");
  }

  return terms[0] ?? null;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSearchTerms(input: string): string[] {
  const normalized = normalizeText(input);
  const terms = normalized
    .split(/\s+/)
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term));

  return [...new Set(terms)];
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function termMatchesHaystack(haystack: string, term: string): boolean {
  if (haystack.includes(term)) return true;

  if (term.length < 5) return false;

  const maxDistance = Math.max(1, Math.floor(term.length * 0.22));
  const words = haystack.split(/\s+/);

  return words.some((word) => {
    if (Math.abs(word.length - term.length) > maxDistance) return false;
    return levenshtein(word, term) <= maxDistance;
  });
}

export interface GroundingCandidate {
  text: string;
  score: number;
}

export function scoreConceptMatch(
  haystack: string,
  concept: string
): { matched: boolean; score: number; terms: string[] } {
  const terms = extractSearchTerms(concept);
  if (terms.length === 0) {
    return { matched: false, score: 0, terms };
  }

  const normalizedHaystack = normalizeText(haystack);
  let score = 0;

  for (const term of terms) {
    if (termMatchesHaystack(normalizedHaystack, term)) {
      score += term.length >= 5 ? 3 : 1;
    }
  }

  const significantTerms = terms.filter((term) => term.length >= 5);
  const matched =
    score > 0 &&
    (significantTerms.some((term) => termMatchesHaystack(normalizedHaystack, term)) ||
      score >= Math.max(2, Math.ceil(terms.length * 0.5)));

  return { matched, score, terms };
}

export function collectGroundingCandidates(
  sources: string[],
  concept: string
): GroundingCandidate[] {
  const { terms } = scoreConceptMatch(sources.join("\n"), concept);
  if (terms.length === 0) return [];

  const candidates: GroundingCandidate[] = [];

  for (const source of sources) {
    const lines = source.split(/\n+/).map((line) => line.trim()).filter(Boolean);

    for (const line of lines) {
      const normalizedLine = normalizeText(line);
      let score = 0;

      for (const term of terms) {
        if (termMatchesHaystack(normalizedLine, term)) {
          score += term.length >= 5 ? 3 : 1;
        }
      }

      if (score > 0) {
        candidates.push({ text: line.slice(0, 500), score });
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export function findBestGroundingSnippet(
  sources: string[],
  concept: string
): string {
  const candidates = collectGroundingCandidates(sources, concept);
  return candidates[0]?.text ?? "";
}

export function isConceptGrounded(
  sources: string[],
  concept: string
): boolean {
  const haystack = sources.join("\n");
  if (!haystack.trim()) return false;
  return scoreConceptMatch(haystack, concept).matched;
}

export function defaultGroundingFromSources(sources: string[]): string {
  for (const source of sources) {
    const line = source
      .split(/\n+/)
      .map((entry) => entry.trim())
      .find(Boolean);
    if (line) return line.slice(0, 500);
  }
  return "";
}

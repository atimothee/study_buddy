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
]);

const VISUAL_INTENT_PATTERN =
  /\b(visuali[sz]e|draw|illustrat|sketch|diagram|xiaohei|explain\s+this\s+visually|visual\s+explanation)\b/i;

export function hasVisualIntent(message: string): boolean {
  return VISUAL_INTENT_PATTERN.test(message);
}

export function extractConceptFromMessage(message: string): string {
  let concept = message.trim();

  const stripPatterns = [
    /^please\s+/i,
    /\b(visuali[sz]e|draw|illustrat|sketch|diagram|show)\s+(me\s+)?/gi,
    /\b(create|make)\s+(a\s+)?(visual|illustration|diagram|xiaohei[- ]style\s+visual\s+explanation)\s+(of|for)\s+/gi,
    /\busing\s+the\s+xiaohei\s+illustration\s+style:?\s*/gi,
    /\bfrom\s+my\s+study\s+set\b/gi,
    /\bthis\s+concept\s+from\s+my\s+study\s+set\b/gi,
    /\bplease\s+visualize\s+this\s+concept\b/gi,
  ];

  for (const pattern of stripPatterns) {
    concept = concept.replace(pattern, " ");
  }

  concept = concept.replace(/\s+/g, " ").trim();
  return concept || message.trim();
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
  return scoreConceptMatch(sources.join("\n"), concept).matched;
}

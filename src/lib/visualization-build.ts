import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  conceptAlignsWithStudySet,
  defaultGroundingFromSources,
  findBestGroundingSnippet,
  isConceptGrounded,
  isVagueVisualRequest,
} from "@/lib/concept-grounding";

const SKILL_ROOT = join(
  process.cwd(),
  "agent/skills/ian-xiaohei-illustrations-en"
);

export interface VisualizationResult {
  title: string;
  shortExplanation: string;
  illustrationPrompt: string;
  illustrationOutput?: string;
  illustrationFormat?: "image" | "svg" | "markdown" | "html" | "prompt";
  sourceGrounding: string;
}

export interface VisualizationStudyContext {
  studySet: {
    title: string;
    summary?: string;
    sourceText: string;
  };
  flashcards: Array<{ front: string; back: string }>;
  quizQuestions: Array<{
    question: string;
    explanation?: string;
    correctAnswer: string;
  }>;
}

async function readSkillReference(name: string): Promise<string> {
  try {
    return await readFile(join(SKILL_ROOT, "references", name), "utf8");
  } catch {
    return "";
  }
}

function contextSources(context: VisualizationStudyContext): string[] {
  return [
    context.studySet.summary ?? "",
    context.studySet.sourceText,
    ...context.flashcards.map((card) => `${card.front}: ${card.back}`),
    ...context.quizQuestions.map(
      (question) =>
        `${question.question} — ${question.explanation ?? question.correctAnswer}`
    ),
  ];
}

export async function buildVisualizationResult(
  context: VisualizationStudyContext,
  concept: string,
  userInstruction?: string,
  grounding?: string
): Promise<VisualizationResult | { error: string }> {
  const sources = contextSources(context);
  const haystack = sources.join("\n");

  if (!haystack.trim()) {
    return { error: "Add study material before creating a visual explanation." };
  }

  let sourceGrounding =
    grounding?.trim() || findBestGroundingSnippet(sources, concept);

  const grounded = isConceptGrounded(sources, concept);
  const studySetLevel =
    isVagueVisualRequest(userInstruction ?? concept) ||
    conceptAlignsWithStudySet(concept, context.studySet.title);

  if (!grounded && !studySetLevel) {
    return { error: "I don't see that in your study material." };
  }

  if (!sourceGrounding) {
    sourceGrounding =
      findBestGroundingSnippet(sources, context.studySet.title) ||
      defaultGroundingFromSources(sources);
  }

  if (!sourceGrounding) {
    return { error: "I don't see that in your study material." };
  }

  const promptTemplate = await readSkillReference("prompt-template.md");
  const styleDna = await readSkillReference("style-dna.md");
  const xiaoheiIp = await readSkillReference("xiaohei-ip.md");

  const title = concept.trim() || context.studySet.title;
  const shortExplanation = `A Xiaohei-style visual explanation of "${title}" grounded in your study set "${context.studySet.title}".`;

  const illustrationPrompt = [
    "16:9 horizontal English study illustration",
    "pure white background",
    "black hand-drawn line art",
    "sparse red/orange/blue handwritten English annotations",
    "lots of empty white space",
    "Xiaohei as the core action subject",
    "no PPT look, no commercial illustration, no childish cuteness",
    "",
    `Concept: ${title}`,
    `Study set: ${context.studySet.title}`,
    userInstruction ? `User instruction: ${userInstruction}` : "",
    "",
    "Grounding from study material:",
    sourceGrounding,
    "",
    "Style DNA (from ian-xiaohei-illustrations-en skill):",
    styleDna.slice(0, 1200),
    "",
    "Xiaohei IP:",
    xiaoheiIp.slice(0, 800),
    "",
    "Prompt template guidance:",
    promptTemplate.slice(0, 1200),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title,
    shortExplanation,
    illustrationPrompt,
    illustrationFormat: "prompt",
    sourceGrounding,
  };
}

export function formatVisualAssistantContent(
  visual: VisualizationResult
): string {
  const assistantText = `Here's a visual explanation of "${visual.title}" based on your study material.`;
  return `${assistantText}\n\n---visualization---\n${JSON.stringify(visual)}`;
}

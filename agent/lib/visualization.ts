import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { StudySetContextResult } from "./study-context.js";

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

async function readSkillReference(name: string): Promise<string> {
  try {
    return await readFile(join(SKILL_ROOT, "references", name), "utf8");
  } catch {
    return "";
  }
}

export async function buildVisualizationResult(
  context: StudySetContextResult,
  concept: string,
  userInstruction?: string,
  grounding?: string
): Promise<VisualizationResult | { error: string }> {
  const sourceGrounding =
    grounding || findGroundingSnippet(context, concept);

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

function findGroundingSnippet(
  context: StudySetContextResult,
  concept: string
): string {
  const terms = concept
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const candidates = [
    context.studySet.summary ?? "",
    ...context.studySet.sourceText.split(/\n+/),
    ...context.flashcards.map((c) => `${c.front}: ${c.back}`),
    ...context.quizQuestions.map(
      (q) => `${q.question} — ${q.explanation ?? q.correctAnswer}`
    ),
  ];

  for (const line of candidates) {
    const lower = line.toLowerCase();
    if (terms.some((term) => lower.includes(term))) {
      return line.trim().slice(0, 500);
    }
  }

  return "";
}

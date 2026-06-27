import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const XIAOHEI_SKILL_ID = "ian-xiaohei-illustrations-en";

const SKILL_ROOT = join(
  process.cwd(),
  "agent/skills/ian-xiaohei-illustrations-en"
);

export interface XiaoheiSkillRefs {
  skillMd: string;
  promptTemplate: string;
  styleDna: string;
  xiaoheiIp: string;
  compositionPatterns: string;
  qaChecklist: string;
}

async function readSkillFile(...parts: string[]): Promise<string> {
  try {
    return await readFile(join(SKILL_ROOT, ...parts), "utf8");
  } catch {
    return "";
  }
}

export async function loadXiaoheiSkillRefs(): Promise<XiaoheiSkillRefs> {
  const [skillMd, promptTemplate, styleDna, xiaoheiIp, compositionPatterns, qaChecklist] =
    await Promise.all([
      readSkillFile("SKILL.md"),
      readSkillFile("references", "prompt-template.md"),
      readSkillFile("references", "style-dna.md"),
      readSkillFile("references", "xiaohei-ip.md"),
      readSkillFile("references", "composition-patterns.md"),
      readSkillFile("references", "qa-checklist.md"),
    ]);

  return {
    skillMd,
    promptTemplate,
    styleDna,
    xiaoheiIp,
    compositionPatterns,
    qaChecklist,
  };
}

function pickStructureType(concept: string): string {
  const lower = concept.toLowerCase();
  if (lower.includes("workflow") || lower.includes("encoder") || lower.includes("decoder")) {
    return "Workflow / system fragment";
  }
  if (lower.includes("before") || lower.includes("after") || lower.includes("vs")) {
    return "Before/After contrast";
  }
  if (lower.includes("layer") || lower.includes("stack")) {
    return "Layered method";
  }
  if (lower.includes("attention") || lower.includes("encoding") || lower.includes("embedding")) {
    return "Conceptual metaphor";
  }
  return "Conceptual metaphor";
}

function pickXiaoheiAction(concept: string): string {
  const lower = concept.toLowerCase();
  if (lower.includes("attention")) {
    return "Xiaohei routes labeled tokens through parallel attention heads";
  }
  if (lower.includes("positional")) {
    return "Xiaohei stamps position markers onto token slots before attention";
  }
  if (lower.includes("embedding")) {
    return "Xiaohei maps discrete tokens into continuous vectors";
  }
  return `Xiaohei physically demonstrates ${concept}`;
}

export function buildXiaoheiIllustrationPrompt(params: {
  concept: string;
  studySetTitle: string;
  sourceGrounding: string;
  userInstruction?: string;
  refs: XiaoheiSkillRefs;
}): string {
  const { concept, studySetTitle, sourceGrounding, userInstruction, refs } = params;
  const structureType = pickStructureType(concept);
  const xiaoheiAction = pickXiaoheiAction(concept);

  const labels = concept
    .split(/\s+/)
    .slice(0, 4)
    .concat(["input", "output"])
    .slice(0, 5)
    .join(" / ");

  const templateBlock = refs.promptTemplate.includes("Generate one standalone")
    ? refs.promptTemplate
    : [
        "Generate one standalone 16:9 horizontal English article illustration.",
        "Pure white background. Black hand-drawn line art. Sparse red/orange/blue English annotations.",
        "Xiaohei performs the core conceptual action.",
      ].join("\n");

  return [
    `Skill: ${XIAOHEI_SKILL_ID}`,
    "Mode: generate (single grounded study illustration)",
    "",
    templateBlock,
    "",
    "=== Filled generation contract (ian-xiaohei-illustrations-en) ===",
    `Study set: ${studySetTitle}`,
    `Concept: ${concept}`,
    userInstruction ? `User instruction: ${userInstruction}` : "",
    "",
    `Theme: ${concept} from the student's study material`,
    `Structure type: ${structureType}`,
    `Core idea: ${sourceGrounding.slice(0, 400)}`,
    `Xiaohei action: ${xiaoheiAction}`,
    `Suggested elements: study notes / key tokens / arrows / labels`,
    `English handwritten labels: ${labels}`,
    "",
    "Grounding from study material (do not add facts beyond this):",
    sourceGrounding,
    "",
    "Style DNA excerpt:",
    refs.styleDna.slice(0, 900),
    "",
    "Xiaohei IP excerpt:",
    refs.xiaoheiIp.slice(0, 700),
    "",
    "Composition patterns excerpt:",
    refs.compositionPatterns.slice(0, 700),
    "",
    "QA checklist excerpt:",
    refs.qaChecklist.slice(0, 500),
    "",
    "Constraints: 16:9, pure white background, one concept only, no top-left title,",
    "no PPT look, English labels only, grounded in the study material above.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function isXiaoheiSkillAvailable(refs: XiaoheiSkillRefs): boolean {
  return Boolean(
    refs.promptTemplate || refs.styleDna || refs.xiaoheiIp || refs.skillMd
  );
}

import {
  findBestGroundingSnippet,
  isConceptGrounded,
  defaultGroundingFromSources,
} from "@/lib/concept-grounding";
import {
  buildXiaoheiIllustrationPrompt,
  isXiaoheiSkillAvailable,
  loadXiaoheiSkillRefs,
  XIAOHEI_SKILL_ID,
  type XiaoheiSkillRefs,
} from "@/lib/xiaohei-skill";

export interface VisualizationResult {
  title: string;
  concept: string;
  shortExplanation: string;
  illustrationPrompt: string;
  illustrationOutput?: string;
  illustrationFormat: "image" | "svg" | "markdown" | "html" | "prompt";
  sourceGrounding: string;
  skillId: string;
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
  grounding?: string,
  skillRefs?: XiaoheiSkillRefs
): Promise<VisualizationResult | { error: string }> {
  const sources = contextSources(context);
  const haystack = sources.join("\n");

  if (!haystack.trim()) {
    return { error: "Add study material before creating a visual explanation." };
  }

  let sourceGrounding =
    grounding?.trim() || findBestGroundingSnippet(sources, concept);

  if (!isConceptGrounded(sources, concept)) {
    return { error: "I don't see that in your study material." };
  }

  if (!sourceGrounding) {
    sourceGrounding = defaultGroundingFromSources(sources);
  }

  if (!sourceGrounding) {
    return { error: "I don't see that in your study material." };
  }

  const refs = skillRefs ?? (await loadXiaoheiSkillRefs());
  if (!isXiaoheiSkillAvailable(refs)) {
    return {
      error:
        "The ian-xiaohei-illustrations-en skill is not available in this deployment.",
    };
  }

  const title = concept.trim() || context.studySet.title;
  const illustrationPrompt = buildXiaoheiIllustrationPrompt({
    concept: title,
    studySetTitle: context.studySet.title,
    sourceGrounding,
    userInstruction,
    refs,
  });

  const shortExplanation = `A Xiaohei-style visual explanation of "${title}" from your study set "${context.studySet.title}", generated with the ${XIAOHEI_SKILL_ID} skill.`;

  return {
    title,
    concept: title,
    shortExplanation,
    illustrationPrompt,
    illustrationFormat: "prompt",
    sourceGrounding,
    skillId: XIAOHEI_SKILL_ID,
  };
}

export function formatVisualAssistantContent(
  visual: VisualizationResult
): string {
  const assistantText = `Here's a Xiaohei visual explanation of "${visual.concept}" based on your study material.`;
  return `${assistantText}\n\n---visualization---\n${JSON.stringify(visual)}`;
}

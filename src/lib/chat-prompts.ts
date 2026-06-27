export interface ChatPromptChip {
  label: string;
  message: string;
  highlight?: boolean;
}

const TRANSFORMER_DEMO_PROMPTS: ChatPromptChip[] = [
  {
    label: "Visualize attention mechanism",
    message: "Visualize attention mechanism",
    highlight: true,
  },
  {
    label: "Visualize multi-head attention",
    message: "Draw multi-head attention",
    highlight: true,
  },
  {
    label: "Illustrate positional encoding",
    message: "Illustrate positional encoding",
    highlight: true,
  },
  {
    label: "Explain self-attention simply",
    message: "Explain self-attention simply using examples from my study material.",
    highlight: true,
  },
  {
    label: "Quiz me one question at a time",
    message: "Quiz me one question at a time based on my study set. Wait for my answer before the next question.",
    highlight: true,
  },
];

const GENERIC_PROMPTS: ChatPromptChip[] = [
  {
    label: "Visualize a key concept",
    message: "Visualize the most important concept from my study material.",
  },
  {
    label: "Explain the hardest concept",
    message: "What is the hardest concept in my study set? Explain it simply.",
  },
  {
    label: "Quiz me one question at a time",
    message: "Quiz me one question at a time. Wait for my answer before the next question.",
  },
  {
    label: "Summarize the key ideas",
    message: "Summarize the key ideas from my study material in simple terms.",
  },
];

function isTransformerDemoSet(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized.includes("attention is all you need") ||
    normalized.includes("transformer") ||
    normalized.includes("self-attention")
  );
}

export function getChatPromptChips(studySetTitle: string): ChatPromptChip[] {
  if (isTransformerDemoSet(studySetTitle)) {
    return TRANSFORMER_DEMO_PROMPTS;
  }
  return GENERIC_PROMPTS;
}

import type { VisualizationResult } from "@/lib/visualization-build";

function attentionSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Multi-head attention diagram">
  <rect width="640" height="360" fill="#ffffff"/>
  <text x="320" y="28" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="#1e293b">Multi-Head Attention (simplified)</text>
  <rect x="40" y="60" width="120" height="44" rx="8" fill="#eef2ff" stroke="#6366f1"/>
  <text x="100" y="87" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#312e81">Input tokens</text>
  <rect x="200" y="52" width="90" height="28" rx="6" fill="#f8fafc" stroke="#94a3b8"/>
  <text x="245" y="71" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#334155">Head 1</text>
  <rect x="200" y="88" width="90" height="28" rx="6" fill="#f8fafc" stroke="#94a3b8"/>
  <text x="245" y="107" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#334155">Head 2</text>
  <rect x="200" y="124" width="90" height="28" rx="6" fill="#f8fafc" stroke="#94a3b8"/>
  <text x="245" y="143" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#334155">Head h</text>
  <text x="245" y="175" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Q · K → softmax → V</text>
  <rect x="340" y="88" width="110" height="44" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="395" y="108" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#78350f">Concat</text>
  <rect x="490" y="88" width="110" height="44" rx="8" fill="#ecfdf5" stroke="#10b981"/>
  <text x="545" y="115" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#065f46">Output</text>
  <line x1="160" y1="82" x2="200" y2="66" stroke="#6366f1" stroke-width="2"/>
  <line x1="160" y1="82" x2="200" y2="102" stroke="#6366f1" stroke-width="2"/>
  <line x1="160" y1="82" x2="200" y2="138" stroke="#6366f1" stroke-width="2"/>
  <line x1="290" y1="66" x2="340" y2="100" stroke="#94a3b8" stroke-width="2"/>
  <line x1="290" y1="102" x2="340" y2="110" stroke="#94a3b8" stroke-width="2"/>
  <line x1="290" y1="138" x2="340" y2="118" stroke="#94a3b8" stroke-width="2"/>
  <line x1="450" y1="110" x2="490" y2="110" stroke="#10b981" stroke-width="2"/>
  <text x="320" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#475569">Each head learns different attention patterns in parallel,</text>
  <text x="320" y="240" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#475569">then outputs are combined for richer representations.</text>
</svg>`;
}

function genericConceptSvg(title: string): string {
  const safe = title.slice(0, 40).replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 280" role="img" aria-label="${safe} diagram">
  <rect width="640" height="280" fill="#ffffff"/>
  <text x="320" y="36" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="#1e293b">${safe}</text>
  <circle cx="160" cy="140" r="48" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
  <text x="160" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#312e81">Source</text>
  <circle cx="320" cy="140" r="48" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="320" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#78350f">Concept</text>
  <circle cx="480" cy="140" r="48" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
  <text x="480" y="145" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#065f46">Recall</text>
  <line x1="208" y1="140" x2="272" y2="140" stroke="#94a3b8" stroke-width="2"/>
  <line x1="368" y1="140" x2="432" y2="140" stroke="#94a3b8" stroke-width="2"/>
</svg>`;
}

export function buildFallbackVisualization(
  concept: string,
  studySetTitle: string,
  sourceGrounding: string
): VisualizationResult {
  const normalized = concept.toLowerCase();
  const isAttention =
    normalized.includes("attention") ||
    normalized.includes("transformer") ||
    normalized.includes("self-attention");

  const title = concept.trim() || studySetTitle;
  const shortExplanation = isAttention
    ? "A simplified diagram of how multi-head attention splits queries, keys, and values across parallel heads before merging."
    : `A concept map showing how "${title}" connects source material to active recall.`;

  return {
    title,
    concept: title,
    shortExplanation,
    illustrationPrompt: `Study illustration for: ${title}`,
    illustrationOutput: isAttention ? attentionSvg() : genericConceptSvg(title),
    illustrationFormat: "svg",
    sourceGrounding:
      sourceGrounding ||
      `Grounded in study set "${studySetTitle}" — diagram fallback when illustration skill output is unavailable.`,
    skillId: "diagram-fallback",
  };
}

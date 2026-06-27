export interface VisualizationPayload {
  title: string;
  concept?: string;
  shortExplanation: string;
  illustrationPrompt: string;
  illustrationOutput?: string;
  illustrationFormat?: "image" | "svg" | "markdown" | "html" | "prompt";
  sourceGrounding: string;
  skillId?: string;
}

export function isVisualizationPayload(
  value: unknown
): value is VisualizationPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.shortExplanation === "string" &&
    typeof v.illustrationPrompt === "string" &&
    typeof v.sourceGrounding === "string"
  );
}

export function extractVisualizationsFromUnknown(
  value: unknown
): VisualizationPayload[] {
  if (isVisualizationPayload(value)) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractVisualizationsFromUnknown);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.result) {
      return extractVisualizationsFromUnknown(record.result);
    }
    if (record.output) {
      return extractVisualizationsFromUnknown(record.output);
    }
  }

  return [];
}

export function parseStoredVisualizations(
  content: string
): VisualizationPayload[] {
  const marker = "\n\n---visualization---\n";
  const idx = content.indexOf(marker);
  if (idx === -1) return [];

  try {
    const parsed = JSON.parse(content.slice(idx + marker.length));
    return extractVisualizationsFromUnknown(parsed);
  } catch {
    return [];
  }
}

export function stripVisualizationMarker(content: string): string {
  const marker = "\n\n---visualization---\n";
  const idx = content.indexOf(marker);
  if (idx === -1) return content;
  return content.slice(0, idx).trim();
}

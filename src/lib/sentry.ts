import * as Sentry from "@sentry/nextjs";

export type AppFeature =
  | "study_generation"
  | "chat"
  | "flashcards"
  | "quiz"
  | "visualization";

export type CaptureAppErrorOptions = {
  feature: AppFeature;
  userId?: string;
  studySetId?: string;
  tool?: string;
  cardType?: string;
  extra?: Record<string, unknown>;
};

const SENSITIVE_KEY_PATTERN =
  /^(source[_-]?text|message|content|answer|front|back|prompt|password|email|token|authorization|file|upload|body|choices|explanation|summary|concept|user[_-]?instruction|artifacts|flashcards|questions)$/i;

const SENSITIVE_VALUE_PATTERN =
  /^(sk-|re_|eyJ|Bearer\s)/i;

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error("Unknown error");
  }
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 3) {
    return "[truncated]";
  }

  if (value == null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    if (value.length > 200) {
      return `[string:${value.length} chars]`;
    }
    if (SENSITIVE_VALUE_PATTERN.test(value)) {
      return "[redacted]";
    }
    return value;
  }

  if (Array.isArray(value)) {
    return {
      count: value.length,
      sample: value.slice(0, 3).map((item) => sanitizeValue(item, depth + 1)),
    };
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(record)) {
      if (isSensitiveKey(key)) {
        if (typeof nested === "string") {
          sanitized[key] = `[redacted:${nested.length} chars]`;
        } else if (Array.isArray(nested)) {
          sanitized[key] = `[redacted array:${nested.length}]`;
        } else {
          sanitized[key] = "[redacted]";
        }
        continue;
      }

      sanitized[key] = sanitizeValue(nested, depth + 1);
    }

    return sanitized;
  }

  return String(value);
}

export function sanitizeExtra(
  extra?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!extra) {
    return undefined;
  }

  return sanitizeValue(extra) as Record<string, unknown>;
}

export function bucketSourceLength(length: number): string {
  if (length < 100) return "0-99";
  if (length < 500) return "100-499";
  if (length < 2000) return "500-1999";
  if (length < 10000) return "2000-9999";
  return "10000+";
}

export function captureAppError(
  error: unknown,
  options: CaptureAppErrorOptions
): void {
  const normalizedError = normalizeError(error);
  const sanitizedExtra = sanitizeExtra(options.extra);

  if (process.env.NODE_ENV === "development") {
    console.error("[captureAppError]", normalizedError.message, {
      feature: options.feature,
      studySetId: options.studySetId,
      userId: options.userId,
      tool: options.tool,
      extra: sanitizedExtra,
    });
  }

  Sentry.withScope((scope) => {
    scope.setTag("feature", options.feature);

    if (options.studySetId) {
      scope.setTag("studySetId", options.studySetId);
    }

    if (options.tool) {
      scope.setTag("agentTool", options.tool);
    }

    if (options.cardType) {
      scope.setTag("cardType", options.cardType);
    }

    if (options.userId) {
      scope.setUser({ id: options.userId });
    }

    if (sanitizedExtra && Object.keys(sanitizedExtra).length > 0) {
      scope.setContext("metadata", sanitizedExtra);
    }

    Sentry.captureException(normalizedError);
  });
}

export async function withAppSpan<T>(
  name: string,
  op: string,
  attributes: Record<string, string | number | boolean | undefined>,
  fn: () => Promise<T> | T
): Promise<T> {
  const spanAttributes = Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;

  return Sentry.startSpan(
    {
      name,
      op,
      attributes: spanAttributes,
    },
    async () => await fn()
  ) as Promise<T>;
}

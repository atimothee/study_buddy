import { APICallError } from "@ai-sdk/provider";

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
}

function parseOpenAiErrorBody(responseBody: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(responseBody) as {
      error?: {
        code?: string;
        message?: string;
        param?: string;
        type?: string;
      };
    };

    const error = parsed.error;
    if (!error) return {};

    return {
      ...(error.code ? { errorCode: error.code } : {}),
      ...(error.message ? { errorMessage: error.message } : {}),
      ...(error.param ? { errorParam: error.param } : {}),
      ...(error.type ? { errorType: error.type } : {}),
    };
  } catch {
    return {};
  }
}

/** Safe metadata for logs/Sentry from AI SDK provider failures. */
export function extractAiErrorDetails(error: unknown): Record<string, unknown> {
  const details: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
  };

  if (APICallError.isInstance(error)) {
    if (error.statusCode != null) details.statusCode = error.statusCode;
    if (error.url) details.url = error.url;
    if (error.data != null) details.data = error.data;

    if (typeof error.responseBody === "string" && error.responseBody.length > 0) {
      details.responseBody = truncate(error.responseBody, 2000);
      Object.assign(details, parseOpenAiErrorBody(error.responseBody));
    }
  }

  return details;
}

export function isInvalidJsonSchemaError(error: unknown): boolean {
  const details = extractAiErrorDetails(error);
  if (details.errorCode === "invalid_json_schema") return true;

  const message = String(details.message ?? "");
  return /invalid_json_schema|invalid schema/i.test(message);
}

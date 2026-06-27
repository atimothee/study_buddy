export async function readJsonBody<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function readApiError(
  response: Response,
  fallback = "Something went wrong. Please try again."
): Promise<string> {
  const data = await readJsonBody<{ error?: string; message?: string }>(response);
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;

  if (!response.ok) {
    try {
      const text = (await response.text()).trim();
      if (text && !text.startsWith("<")) {
        return text.slice(0, 200);
      }
    } catch {
      // ignore
    }
    return fallback;
  }

  return fallback;
}

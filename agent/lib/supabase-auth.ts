import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { extractBearerToken, type AuthFn } from "eve/channels/auth";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function parseCookieHeader(header: string): Array<{ name: string; value: string }> {
  const cookies: Array<{ name: string; value: string }> = [];

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    cookies.push({
      name: trimmed.slice(0, eq).trim(),
      value: decodeURIComponent(trimmed.slice(eq + 1).trim()),
    });
  }

  return cookies;
}

function principalFromUser(user: {
  id: string;
  email?: string | null;
}, authenticator: string) {
  return {
    principalId: user.id,
    principalType: "user" as const,
    authenticator,
    subject: user.id,
    attributes: {
      email: user.email ?? "",
    },
  };
}

export function supabaseBearerAuth(): AuthFn<Request> {
  return async (request) => {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) return null;

    const config = getSupabaseConfig();
    if (!config) return null;

    const supabase = createClient(config.url, config.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    return principalFromUser(user, "supabase-bearer");
  };
}

/** Same-origin browser requests send Supabase session cookies automatically. */
export function supabaseCookieAuth(): AuthFn<Request> {
  return async (request) => {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const config = getSupabaseConfig();
    if (!config) return null;

    const parsed = parseCookieHeader(cookieHeader);

    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll() {
          return parsed;
        },
        setAll() {
          // Read-only validation for Eve channel requests.
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    return principalFromUser(user, "supabase-cookie");
  };
}

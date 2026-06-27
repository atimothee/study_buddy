import { createClient } from "@supabase/supabase-js";
import { extractBearerToken, type AuthFn } from "eve/channels/auth";

export function supabaseBearerAuth(): AuthFn<Request> {
  return async (request) => {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) return null;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    return {
      principalId: user.id,
      principalType: "user",
      authenticator: "supabase-bearer",
      subject: user.id,
      attributes: {
        email: user.email ?? "",
      },
    };
  };
}

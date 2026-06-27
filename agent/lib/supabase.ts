import { createClient } from "@supabase/supabase-js";
import { captureAppError } from "../../src/lib/sentry.js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const error = new Error("Missing Supabase service role configuration");
    captureAppError(error, {
      feature: "study_generation",
      tool: "supabaseClient",
    });
    throw error;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

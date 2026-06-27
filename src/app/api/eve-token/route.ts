import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAiConfigured,
  shouldUseFallbackChat,
} from "@/lib/ai/client";
import { mintEveSessionToken, verifyEveSessionToken } from "@/lib/eve/session-token";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = mintEveSessionToken(user.id);
    if (!verifyEveSessionToken(token)) {
      return NextResponse.json(
        { error: "Eve session token misconfigured" },
        { status: 503 }
      );
    }
    return NextResponse.json({
      token,
      aiConfigured: isAiConfigured(),
      preferFallback: shouldUseFallbackChat(),
    });
  } catch {
    return NextResponse.json(
      { error: "Eve session token unavailable" },
      { status: 503 }
    );
  }
}

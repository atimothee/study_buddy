import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 5 * 60 * 1000;

function getSessionSecret(): string | null {
  return (
    process.env.EVE_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    null
  );
}

export function mintEveSessionToken(userId: string): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Missing EVE_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  }

  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${exp}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${Buffer.from(payload, "utf8").toString("base64url")}.${signature}`;
}

export function verifyEveSessionToken(token: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const separator = payload.lastIndexOf(":");
  if (separator <= 0) return null;

  const userId = payload.slice(0, separator);
  const exp = Number(payload.slice(separator + 1));
  if (!userId || !Number.isFinite(exp) || Date.now() > exp) return null;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  return userId;
}

import { Client, type ClientAuth } from "eve/client";
import { mintEveSessionToken } from "@/lib/eve/session-token";

export function getEveHost(): string {
  if (process.env.EVE_AGENT_URL) {
    return process.env.EVE_AGENT_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
}

async function buildEveClientAuth(
  userId: string,
  accessToken?: string | null
): Promise<ClientAuth | undefined> {
  try {
    const eveToken = mintEveSessionToken(userId);
    return { bearer: async () => eveToken };
  } catch {
    if (accessToken) {
      return { bearer: async () => accessToken };
    }

    try {
      const { getVercelOidcToken } = await import("@vercel/oidc");
      return {
        vercelOidc: {
          token: async () => getVercelOidcToken(),
        },
      };
    } catch {
      return undefined;
    }
  }
}

export async function createAuthenticatedEveClient(
  userId: string,
  accessToken?: string | null
): Promise<Client> {
  return new Client({
    host: getEveHost(),
    auth: await buildEveClientAuth(userId, accessToken),
  });
}

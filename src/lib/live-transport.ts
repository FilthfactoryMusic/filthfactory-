export type LiveTransportMode = "livekit" | "mesh";

export type LiveTransportInfo = {
  mode: LiveTransportMode;
  configured: boolean;
};

const LIVE_ID_RE = /^[A-Za-z0-9_-]+$/;

export function liveKitRoomName(liveId: string) {
  if (!LIVE_ID_RE.test(liveId)) throw new Error("INVALID_LIVE_ID");
  return `live_${liveId}`;
}

export function liveKitConfigured(env: Record<string, string | undefined> = process.env) {
  const url = String(env["LIVEKIT_URL"] ?? "").trim();
  const key = String(env["LIVEKIT_API_KEY"] ?? "").trim();
  const secret = String(env["LIVEKIT_API_SECRET"] ?? "").trim();
  return Boolean(url && key && secret);
}

/**
 * LIVE_TRANSPORT=livekit|mesh wins.
 * Unset: preview/staging default to LiveKit; www/production (filthfactory.co.uk) stays mesh.
 */
export function resolveLiveTransport(
  env: Record<string, string | undefined> = process.env,
): LiveTransportMode {
  const flag = env["LIVE_TRANSPORT"]?.trim().toLowerCase();
  if (flag === "livekit") return "livekit";
  if (flag === "mesh") return "mesh";

  const hosts = [env.APP_URL, env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const vercelEnv = env.VERCEL_ENV ?? "";
  const stagingHint = /staging|preview/.test(hosts) || vercelEnv === "preview" || vercelEnv === "development";
  if (stagingHint) return "livekit";

  const wwwProd =
    vercelEnv === "production" && /(?:^|[/.])(?:www\.)?filthfactory\.co\.uk/.test(hosts);
  if (wwwProd) return "mesh";

  return "livekit";
}

export function liveTransportInfo(
  env: Record<string, string | undefined> = process.env,
): LiveTransportInfo {
  const mode = resolveLiveTransport(env);
  return {
    mode,
    configured: mode === "mesh" || liveKitConfigured(env),
  };
}

export const LIVEKIT_MISSING_MSG = "LiveKit is not configured on this server.";

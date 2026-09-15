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
 * If LiveKit keys exist, use LiveKit — including www.filthfactory.co.uk.
 * Mesh is the fallback when keys are missing (same-WiFi only, not a real broadcast).
 */
export function resolveLiveTransport(
  env: Record<string, string | undefined> = process.env,
): LiveTransportMode {
  const flag = env["LIVE_TRANSPORT"]?.trim().toLowerCase();
  if (flag === "livekit") return "livekit";
  if (flag === "mesh") return "mesh";
  if (liveKitConfigured(env)) return "livekit";
  return "mesh";
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
export const LIVEKIT_CONNECT_MSG = "Can't reach the live room. Tap the listen link again.";

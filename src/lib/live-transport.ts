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

/** Read host env at request time. Vite must not inline these. */
export function runtimeGet(name: string): string {
  try {
    const fn = new Function(
      "k",
      "try { return String((globalThis.process && globalThis.process.env && globalThis.process.env[k]) || ''); } catch (e) { return ''; }",
    );
    return String(fn(name) || "").trim();
  } catch {
    return "";
  }
}

export function runtimeLiveEnv(): Record<string, string | undefined> {
  return {
    LIVE_TRANSPORT: runtimeGet("LIVE_TRANSPORT"),
    LIVEKIT_URL: runtimeGet("LIVEKIT_URL"),
    LIVEKIT_API_KEY: runtimeGet("LIVEKIT_API_KEY"),
    LIVEKIT_API_SECRET: runtimeGet("LIVEKIT_API_SECRET"),
    APP_URL: runtimeGet("APP_URL"),
    VERCEL_ENV: runtimeGet("VERCEL_ENV"),
    VERCEL_URL: runtimeGet("VERCEL_URL"),
    VERCEL_PROJECT_PRODUCTION_URL: runtimeGet("VERCEL_PROJECT_PRODUCTION_URL"),
  };
}

export function liveKitConfigured(env: Record<string, string | undefined> = process.env) {
  const url = String(env["LIVEKIT_URL"] ?? "").trim();
  const key = String(env["LIVEKIT_API_KEY"] ?? "").trim();
  const secret = String(env["LIVEKIT_API_SECRET"] ?? "").trim();
  return Boolean(url && key && secret);
}

/**
 * Keys present → LiveKit (including www).
 * LIVE_TRANSPORT=mesh forces mesh.
 * Never return livekit without keys — that bricks the booth.
 */
export function resolveLiveTransport(
  env: Record<string, string | undefined> = process.env,
): LiveTransportMode {
  const flag = env["LIVE_TRANSPORT"]?.trim().toLowerCase();
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

/** LiveKit never falls back to mesh/openrelay. Missing env fails closed. */
export function clientTransportPlan(info: LiveTransportInfo): {
  livekit: boolean;
  mesh: boolean;
  error: string | null;
} {
  if (info.mode === "mesh") return { livekit: false, mesh: true, error: null };
  if (!info.configured) return { livekit: false, mesh: false, error: LIVEKIT_MISSING_MSG };
  return { livekit: true, mesh: false, error: null };
}

/** Host may create a booth row only when mesh, or when LiveKit is actually configured. */
export function boothPublishAllowed(info: LiveTransportInfo): { ok: boolean; error: string | null } {
  if (info.mode === "mesh") return { ok: true, error: null };
  if (!info.configured) return { ok: false, error: LIVEKIT_MISSING_MSG };
  return { ok: true, error: null };
}

/** Open join: public subscribe, no publish. Host grant stays separate. */
export function liveKitViewerGrant(room: string) {
  return {
    roomJoin: true as const,
    room,
    roomCreate: false as const,
    canPublish: false as const,
    canSubscribe: true as const,
    canPublishData: false as const,
  };
}

export function liveKitHostGrant(room: string) {
  return {
    roomJoin: true as const,
    room,
    roomCreate: true as const,
    canPublish: true as const,
    canSubscribe: true as const,
    canPublishData: true as const,
  };
}

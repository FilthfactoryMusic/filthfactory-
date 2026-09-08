import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { liveKitRoomName, resolveLiveTransport } from "@/lib/live-transport";

export type LiveKitMint = {
  mode: "livekit";
  url: string;
  token: string;
  room: string;
};

function runtimeGet(name: string): string {
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

function normalizeLiveKitUrl(raw: string) {
  let url = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!url) return "";
  if (url.startsWith("https://")) url = `wss://${url.slice("https://".length)}`;
  if (url.startsWith("http://")) url = `ws://${url.slice("http://".length)}`;
  if (!/^wss?:\/\//i.test(url) && /livekit\.cloud/i.test(url)) url = `wss://${url.replace(/^\/+/, "")}`;
  return url.replace(/\/+$/, "");
}

function readLiveKitEnv() {
  const url = normalizeLiveKitUrl(runtimeGet("LIVEKIT_URL"));
  const apiKey = runtimeGet("LIVEKIT_API_KEY");
  const apiSecret = runtimeGet("LIVEKIT_API_SECRET");
  if (!url) throw new Error("LIVEKIT_URL_MISSING");
  if (!apiKey) throw new Error("LIVEKIT_KEY_MISSING");
  if (!apiSecret) throw new Error("LIVEKIT_SECRET_MISSING");
  if (!/^wss?:\/\//i.test(url)) throw new Error("LIVEKIT_URL_BAD");
  return { url, apiKey, apiSecret };
}

function assertLiveKitMode() {
  if (resolveLiveTransport() !== "livekit") throw new Error("LIVEKIT_DISABLED");
  return readLiveKitEnv();
}

async function liveExists(liveId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string; user_id: string }>`
    select id, user_id from booth_lives where id = ${liveId}
  `;
  return rows[0] ?? null;
}

async function mintJwt(opts: {
  apiKey: string;
  apiSecret: string;
  identity: string;
  name: string;
  room: string;
  canPublish: boolean;
  canSubscribe: boolean;
}) {
  const { AccessToken } = await import("livekit-server-sdk");
  const at = new AccessToken(opts.apiKey, opts.apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: "6h",
  });
  at.addGrant({
    roomJoin: true,
    room: opts.room,
    roomCreate: opts.canPublish,
    canPublish: opts.canPublish,
    canSubscribe: opts.canSubscribe,
    canPublishData: opts.canPublish,
  });
  return at.toJwt();
}

export const getLiveTransport = createServerFn({ method: "GET" }).handler(async () => {
  const mode = resolveLiveTransport();
  if (mode === "mesh") return { mode, configured: true as const };
  try {
    readLiveKitEnv();
    return { mode: "livekit" as const, configured: true as const };
  } catch {
    return { mode: "livekit" as const, configured: false as const };
  }
});

export const mintLiveKitViewerToken = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; viewerId: string }) => d)
  .handler(async ({ data }): Promise<LiveKitMint> => {
    const creds = assertLiveKitMode();
    const liveId = data.liveId.slice(0, 80);
    const room = liveKitRoomName(liveId);
    const live = await liveExists(liveId);
    if (!live) throw new Error("ENDED");
    const viewerId = data.viewerId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "anon";
    const token = await mintJwt({
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      identity: `viewer_${viewerId}`,
      name: "Listener",
      room,
      canPublish: false,
      canSubscribe: true,
    });
    return { mode: "livekit", url: creds.url, token, room };
  });

export const mintLiveKitHostToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { liveId: string; displayName?: string }) => d)
  .handler(async ({ context, data }): Promise<LiveKitMint> => {
    const creds = assertLiveKitMode();
    const liveId = data.liveId.slice(0, 80);
    const room = liveKitRoomName(liveId);
    const live = await liveExists(liveId);
    if (!live) throw new Error("ENDED");
    if (live.user_id !== context.userId) throw new Error("NOT_HOST");

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    let sub = (
      await sql<{ plan: string; status: string }>`
        select plan, status from subscriptions where user_id = ${context.userId}
      `
    )[0];
    if (!sub || sub.status !== "active") {
      const { activatePaidPlan } = await import("@/lib/billing-api");
      const recovered = await activatePaidPlan(context.userId);
      if (!recovered) throw new Error("MEMBERSHIP_REQUIRED");
      sub = { plan: recovered.plan, status: recovered.status };
    }
    if (sub.plan !== "resident" && sub.plan !== "featured") throw new Error("MEMBERSHIP_REQUIRED");

    const name = (data.displayName ?? "Resident").trim().slice(0, 80) || "Resident";
    const token = await mintJwt({
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      identity: `host_${context.userId.slice(0, 48)}`,
      name,
      room,
      canPublish: true,
      canSubscribe: true,
    });
    return { mode: "livekit", url: creds.url, token, room };
  });

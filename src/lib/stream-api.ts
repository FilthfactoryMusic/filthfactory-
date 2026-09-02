import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const MAX_VIEWERS = 12;
const MAX_PAYLOAD = 24_000;
const STALE_MS = 20_000;

type SignalRow = {
  id: string;
  live_id: string;
  viewer_id: string;
  from_role: string;
  kind: string;
  payload: string;
  created_at: string;
};

export type Signal = {
  id: string;
  liveId: string;
  viewerId: string;
  fromRole: "host" | "viewer";
  kind: "offer" | "answer" | "ice" | "hangup";
  payload: string;
};

function asSignal(row: SignalRow): Signal {
  return {
    id: row.id,
    liveId: row.live_id,
    viewerId: row.viewer_id,
    fromRole: row.from_role === "host" ? "host" : "viewer",
    kind: row.kind as Signal["kind"],
    payload: row.payload,
  };
}

function rid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const pingBoothHost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { liveId: string }) => d)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update booth_lives set last_seen = now(),
        listeners = 1 + coalesce((
          select count(*) from booth_viewers
          where live_id = ${data.liveId}
            and last_seen > now() - interval '20 seconds'
        ), 0)
      where id = ${data.liveId} and user_id = ${context.userId}
    `;
    const rows = await sql<{ viewer_id: string }>`
      select viewer_id from booth_viewers
      where live_id = ${data.liveId}
        and last_seen > now() - interval '20 seconds'
    `;
    return { viewerIds: rows.map((r) => r.viewer_id) };
  });

export const joinBoothStream = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; viewerId: string }) => d)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const live = (
      await sql<{ id: string; last_seen: string }>`
        select id, last_seen from booth_lives where id = ${data.liveId}
      `
    )[0];
    if (!live) throw new Error("ENDED");
    const viewerId = data.viewerId.slice(0, 80);
    const n = (
      await sql<{ c: number }>`
        select count(*)::int as c from booth_viewers
        where live_id = ${data.liveId} and last_seen > now() - interval '20 seconds'
      `
    )[0]?.c ?? 0;
    const already = (
      await sql<{ viewer_id: string }>`
        select viewer_id from booth_viewers
        where live_id = ${data.liveId} and viewer_id = ${viewerId}
      `
    )[0];
    if (!already && n >= MAX_VIEWERS) throw new Error("ROOM_FULL");
    await sql`
      insert into booth_viewers (live_id, viewer_id, last_seen)
      values (${data.liveId}, ${viewerId}, now())
      on conflict (live_id, viewer_id) do update set last_seen = now()
    `;
    return { ok: true as const, hostSeen: live.last_seen };
  });

export const leaveBoothStream = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; viewerId: string }) => d)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from booth_viewers where live_id = ${data.liveId} and viewer_id = ${data.viewerId}`;
  });

export const postBoothSignal = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; viewerId: string; fromRole: "host" | "viewer"; kind: Signal["kind"]; payload: string }) => d)
  .handler(async ({ data }) => {
    if (data.payload.length > MAX_PAYLOAD) throw new Error("SIGNAL_TOO_LARGE");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const live = (await sql<{ id: string }>`select id from booth_lives where id = ${data.liveId}`)[0];
    if (!live) throw new Error("ENDED");
    const id = rid("sig");
    await sql`
      insert into booth_signals (id, live_id, viewer_id, from_role, kind, payload)
      values (${id}, ${data.liveId}, ${data.viewerId}, ${data.fromRole}, ${data.kind}, ${data.payload})
    `;
    return { id };
  });

export const pullBoothSignals = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; viewerId: string; role: "host" | "viewer" }) => d)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const from = data.role === "host" ? "viewer" : "host";
    const rows = await sql<SignalRow>`
      select id, live_id, viewer_id, from_role, kind, payload, created_at
      from booth_signals
      where live_id = ${data.liveId}
        and from_role = ${from}
        and consumed = false
        and (${data.role} = 'host' or viewer_id = ${data.viewerId})
      order by created_at asc
      limit 80
    `;
    if (rows.length) {
      const ids = rows.map((r) => r.id);
      for (const id of ids) {
        await sql`update booth_signals set consumed = true where id = ${id}`;
      }
    }
    await sql`delete from booth_signals where live_id = ${data.liveId} and created_at < now() - interval '2 minutes'`;
    return rows.map(asSignal);
  });

export const postBoothChunk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { liveId: string; seq: number; mime: string; data: string }) => d)
  .handler(async ({ context, data }) => {
    if (data.data.length > 80_000) throw new Error("CHUNK_TOO_LARGE");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const live = (
      await sql<{ id: string }>`
        select id from booth_lives where id = ${data.liveId} and user_id = ${context.userId}
      `
    )[0];
    if (!live) throw new Error("ENDED");
    await sql`
      insert into booth_chunks (live_id, seq, mime, data)
      values (${data.liveId}, ${data.seq}, ${data.mime}, ${data.data})
    `;
    await sql`
      delete from booth_chunks
      where live_id = ${data.liveId}
        and seq < ${data.seq - 40}
    `;
  });

export const pullBoothChunks = createServerFn({ method: "POST" })
  .validator((d: { liveId: string; afterSeq: number }) => d)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ seq: number; mime: string; data: string }>`
      select seq, mime, data from booth_chunks
      where live_id = ${data.liveId} and seq > ${data.afterSeq}
      order by seq asc
      limit 24
    `;
    return rows;
  });

export const loadBoothLive = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const { liveFromRow } = await import("@/lib/live-api");
    const rows = await sql<Parameters<typeof liveFromRow>[0]>`
      select id, user_id, display_name, photo, title, genre, city, city_slug, engine, bpm, seed, has_camera, listeners, started_at, featured
      from booth_lives where id = ${data.id}
    `;
    const row = rows[0];
    return row ? liveFromRow(row) : null;
  });

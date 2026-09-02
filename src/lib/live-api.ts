import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { genreToEngine } from "@/lib/catalog";
import { hashString } from "@/lib/utils";
import type { EngineGenre, LiveShow, Mix } from "@/lib/types";

export type LiveRow = {
  id: string;
  user_id: string;
  display_name: string;
  photo: string | null;
  title: string;
  genre: string;
  city: string;
  city_slug: string;
  engine: string;
  bpm: number;
  seed: number;
  has_camera: boolean;
  listeners: number;
  started_at: string;
  featured: boolean;
};

type MixRow = {
  id: string;
  user_id: string;
  display_name: string;
  title: string;
  genre: string;
  city: string;
  city_slug: string;
  description: string;
  engine: string;
  bpm: number;
  seed: number;
  duration: number;
  created_at: string;
};

function asEngine(v: string): EngineGenre {
  const ok: EngineGenre[] = [
    "ukg",
    "dnb",
    "techno",
    "house",
    "grime",
    "jungle",
    "bassline",
    "breaks",
    "funky",
    "disco",
    "electro",
    "industrial",
  ];
  return ok.includes(v as EngineGenre) ? (v as EngineGenre) : "house";
}

export function liveFromRow(row: LiveRow): LiveShow {
  return {
    id: row.id,
    djId: `u:${row.user_id}`,
    title: row.title,
    venue: "Filthfactory booth",
    city: row.city,
    citySlug: row.city_slug,
    artwork: row.photo || "/art/brand/logo.png",
    genres: [row.genre],
    engine: asEngine(row.engine),
    bpm: row.bpm,
    listeners: row.listeners,
    durationMin: 180,
    description: `${row.display_name} is live from the booth.`,
    tracklist: [{ t: 0, title: `${row.display_name} — live` }],
    status: "live",
    seed: row.seed,
    hostUserId: row.user_id,
    hostName: row.display_name,
    hasCamera: row.has_camera,
    startsAt: row.started_at,
    advertised: Boolean(row.featured),
  };
}

function mixFromRow(row: MixRow): Mix {
  return {
    id: row.id,
    title: row.title,
    djId: `u:${row.user_id}`,
    show: row.display_name,
    artwork: "/art/brand/logo.png",
    city: row.city,
    citySlug: row.city_slug,
    genres: [row.genre],
    engine: asEngine(row.engine),
    bpm: row.bpm,
    duration: row.duration,
    plays: 0,
    likes: 0,
    uploadedAt: row.created_at,
    description: row.description,
    tracklist: [{ t: 0, title: `${row.display_name} — ${row.title}` }],
    comments: [],
    tags: [row.genre.toLowerCase(), "booth"],
    seed: row.seed,
  };
}

export const listBoothLives = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<LiveRow>`
    select id, user_id, display_name, photo, title, genre, city, city_slug, engine, bpm, seed, has_camera, listeners, started_at, featured
    from booth_lives
    order by featured desc, started_at desc
    limit 24
  `;
  return rows.map(liveFromRow);
});

export const startBoothLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { title: string; genre: string; hasCamera: boolean; displayName: string; photo?: string | null; city?: string; citySlug?: string; rightsConfirmed: boolean }) => d)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (!data.rightsConfirmed) throw new Error("RIGHTS_REQUIRED");
    const sub = (
      await sql<{ plan: string; status: string }>`
        select plan, status from subscriptions where user_id = ${context.userId}
      `
    )[0];
    if (!sub || sub.status !== "active") {
      throw new Error("MEMBERSHIP_REQUIRED");
    }
    const featured = sub.plan === "featured";
    const title = data.title.trim() || "Live from the factory";
    const genre = data.genre.trim() || "UK Garage";
    const engine = genreToEngine(genre);
    const id = `live-${context.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    const seed = hashString(id) % 99991;
    const displayName = data.displayName.trim() || "Resident";
    await sql`delete from booth_lives where user_id = ${context.userId}`;
    await sql`
      insert into booth_lives (
        id, user_id, display_name, photo, title, genre, city, city_slug, engine, bpm, seed, has_camera, listeners, featured
      ) values (
        ${id}, ${context.userId}, ${displayName}, ${data.photo ?? null}, ${title}, ${genre},
        ${data.city ?? "UK"}, ${data.citySlug ?? "london"}, ${engine}, 132, ${seed}, ${data.hasCamera}, 1, ${featured}
      )
    `;
    const rows = await sql<LiveRow>`
      select id, user_id, display_name, photo, title, genre, city, city_slug, engine, bpm, seed, has_camera, listeners, started_at, featured
      from booth_lives where id = ${id}
    `;
    const row = rows[0];
    if (!row) throw new Error("Failed to go live");
    return liveFromRow(row);
  });

export const setBoothLiveName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string; displayName: string; photo?: string | null }) => d)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update booth_lives
      set display_name = ${data.displayName}, photo = ${data.photo ?? null}
      where id = ${data.id} and user_id = ${context.userId}
    `;
  });

export const stopBoothLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from booth_lives where user_id = ${context.userId}`;
  });

export const dropBoothMix = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (d: {
      title: string;
      genre: string;
      city: string;
      citySlug: string;
      description: string;
      displayName: string;
      rightsConfirmed: boolean;
    }) => d,
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (!data.rightsConfirmed) throw new Error("RIGHTS_REQUIRED");
    const sub = (
      await sql<{ status: string }>`
        select status from subscriptions where user_id = ${context.userId}
      `
    )[0];
    if (!sub || sub.status !== "active") throw new Error("MEMBERSHIP_REQUIRED");
    const title = data.title.trim();
    if (!title) throw new Error("Title required");
    const genre = data.genre.trim() || "UK Garage";
    const engine = genreToEngine(genre);
    const id = `drop-${context.userId.slice(0, 8)}-${Date.now().toString(36)}`;
    const seed = hashString(id) % 99991;
    const name = data.displayName.trim() || "You";
    await sql`
      insert into booth_mixes (
        id, user_id, display_name, title, genre, city, city_slug, description, engine, bpm, seed, duration
      ) values (
        ${id}, ${context.userId}, ${name}, ${title}, ${genre}, ${data.city}, ${data.citySlug},
        ${data.description}, ${engine}, 130, ${seed}, 3600
      )
    `;
    const rows = await sql<MixRow>`
      select id, user_id, display_name, title, genre, city, city_slug, description, engine, bpm, seed, duration, created_at
      from booth_mixes where id = ${id}
    `;
    const row = rows[0];
    if (!row) throw new Error("Failed to drop mix");
    return mixFromRow(row);
  });

export const listMyMixes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<MixRow>`
      select id, user_id, display_name, title, genre, city, city_slug, description, engine, bpm, seed, duration, created_at
      from booth_mixes where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map(mixFromRow);
  });

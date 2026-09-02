import { createServerFn } from "@tanstack/react-start";
import { chartWeekId } from "./chart-week";
import type { Mix } from "./types";

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  preview: string;
  link: string;
  artist: { name: string };
  album?: { cover_medium?: string; cover_xl?: string };
};

type DeezerPlaylist = {
  title?: string;
  tracks?: { data?: DeezerTrack[] };
};

export type ChartPack = {
  weekId: string;
  featured: Mix[];
  trending: Mix[];
};

const UKG_PLAYLIST = "8019848102";
const DNB_PLAYLIST = "13907096541";

function beatportSearch(title: string, artist: string) {
  return `https://www.beatport.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
}

function spotifySearch(title: string, artist: string) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`;
}

function asMix(t: DeezerTrack, genre: "UK Garage" | "Drum & Bass", engine: Mix["engine"], i: number): Mix | null {
  if (!t.preview) return null;
  return {
    id: `chart-${engine}-${t.id}`,
    title: t.title,
    djId: "",
    show: t.artist.name,
    artwork: t.album?.cover_xl || t.album?.cover_medium || "/art/brand/logo.png",
    city: "UK",
    citySlug: "london",
    genres: [genre],
    engine,
    bpm: engine === "dnb" ? 174 : 132,
    duration: 30,
    plays: Math.max(0, 20000 - i * 173),
    likes: Math.max(0, 1200 - i * 11),
    uploadedAt: new Date().toISOString(),
    description: `${t.artist.name} — ${t.title}. 30-second licensed preview. Full track on Spotify and Beatport.`,
    tracklist: [{ t: 0, title: `${t.artist.name} — ${t.title}` }],
    comments: [],
    tags: [genre.toLowerCase(), "chart"],
    seed: t.id,
    streamUrl: t.preview,
    credit: "30s preview via Deezer. Full release on Spotify / Beatport.",
    featured: i < 4,
    beatportUrl: beatportSearch(t.title, t.artist.name),
    spotifyUrl: spotifySearch(t.title, t.artist.name),
  };
}

async function pullPlaylist(id: string): Promise<DeezerTrack[]> {
  const res = await fetch(`https://api.deezer.com/playlist/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("CHART_FETCH");
  const data = (await res.json()) as DeezerPlaylist;
  return data.tracks?.data ?? [];
}

async function fetchLive(): Promise<{ featured: Mix[]; trending: Mix[] }> {
  const [ukg, dnb] = await Promise.all([pullPlaylist(UKG_PLAYLIST), pullPlaylist(DNB_PLAYLIST)]);
  return {
    featured: ukg
      .map((t, i) => asMix(t, "UK Garage", "ukg", i))
      .filter((m): m is Mix => Boolean(m))
      .slice(0, 10),
    trending: dnb
      .map((t, i) => asMix(t, "Drum & Bass", "dnb", i))
      .filter((m): m is Mix => Boolean(m))
      .slice(0, 10),
  };
}

async function readWeek(weekId: string) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ featured: string; trending: string }>`
      select featured, trending from chart_weeks where week_id = ${weekId}
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      featured: JSON.parse(row.featured) as Mix[],
      trending: JSON.parse(row.trending) as Mix[],
    };
  } catch {
    return null;
  }
}

async function writeWeek(weekId: string, featured: Mix[], trending: Mix[]) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const f = JSON.stringify(featured);
    const t = JSON.stringify(trending);
    await sql`
      insert into chart_weeks (week_id, featured, trending)
      values (${weekId}, ${f}, ${t})
      on conflict (week_id) do update set featured = ${f}, trending = ${t}
    `;
  } catch {
    /* preview without db still serves live fetch */
  }
}

export const loadUkCharts = createServerFn({ method: "GET" }).handler(async (): Promise<ChartPack> => {
  const weekId = chartWeekId();
  const locked = await readWeek(weekId);
  if (locked?.featured.length) return { weekId, ...locked };
  const live = await fetchLive();
  await writeWeek(weekId, live.featured, live.trending);
  return { weekId, ...live };
});

/** Friday 00:00 job — pull a new lock for the new chart week. */
export const refreshUkCharts = createServerFn({ method: "POST" }).handler(async (): Promise<ChartPack> => {
  const weekId = chartWeekId();
  const live = await fetchLive();
  await writeWeek(weekId, live.featured, live.trending);
  return { weekId, ...live };
});

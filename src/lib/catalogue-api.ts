import { createServerFn } from "@tanstack/react-start";
import type { EngineGenre, Mix } from "./types";

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  preview?: string;
  link?: string;
  artist?: { name?: string };
  album?: { title?: string; cover_medium?: string; cover_xl?: string; release_date?: string };
};

const FRESH_MS = 90 * 24 * 60 * 60 * 1000;

export const GENRE_CRATES: {
  slug: string;
  name: string;
  q: string;
  engine: EngineGenre;
}[] = [
  { slug: "uk-garage", name: "UK Garage", q: "UK garage", engine: "ukg" },
  { slug: "2-step", name: "2-Step", q: "2-step garage", engine: "ukg" },
  { slug: "drum-bass", name: "Drum & Bass", q: "drum and bass", engine: "dnb" },
  { slug: "jungle", name: "Jungle", q: "jungle music UK", engine: "jungle" },
  { slug: "grime", name: "Grime", q: "UK grime", engine: "grime" },
  { slug: "bassline", name: "Bassline", q: "UK bassline", engine: "bassline" },
  { slug: "techno", name: "Techno", q: "techno", engine: "techno" },
  { slug: "house", name: "House", q: "house music", engine: "house" },
  { slug: "breaks", name: "Breaks", q: "breaks music", engine: "breaks" },
  { slug: "uk-funky", name: "UK Funky", q: "UK funky", engine: "funky" },
  { slug: "disco", name: "Disco", q: "nu disco", engine: "disco" },
  { slug: "electro", name: "Electro", q: "electro", engine: "electro" },
  { slug: "broken-beat", name: "Broken Beat", q: "broken beat", engine: "breaks" },
  { slug: "industrial", name: "Industrial", q: "industrial techno", engine: "industrial" },
];

export function cutFromTitle(title: string) {
  const m = title.match(/\(([^)]+)\)\s*$/);
  if (!m) return undefined;
  const cut = m[1].trim();
  if (/mix|vip|dub|edit|remix|extended|instrumental|version|bootleg|refix|rework/i.test(cut)) return cut;
  return undefined;
}
  return `https://www.beatport.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
}

export function spotifySearch(title: string, artist: string) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`;
}

export function bandcampSearch(title: string, artist: string) {
  return `https://bandcamp.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
}

export function trackToMix(
  t: DeezerTrack,
  genre: string,
  engine: EngineGenre,
  i: number,
  prefix = "dz",
  opts?: { skipFresh?: boolean; requirePreview?: boolean },
): Mix | null {
  if ((opts?.requirePreview ?? true) && !t.preview) return null;
  if (!t.title) return null;
  const artist = t.artist?.name || "Unknown";
  const released = t.album?.release_date;
  if (!opts?.skipFresh && released) {
    const ts = Date.parse(released);
    if (Number.isFinite(ts) && Date.now() - ts > FRESH_MS) return null;
  }
  const album = t.album?.title?.trim();
  const cut = cutFromTitle(t.title);
  const label = album && album.toLowerCase() !== t.title.toLowerCase() ? album : undefined;
  return {
    id: `${prefix}-${t.id}`,
    title: t.title,
    djId: "",
    show: artist,
    artwork: t.album?.cover_xl || t.album?.cover_medium || "/art/brand/logo.png",
    city: "UK",
    citySlug: "london",
    genres: [genre],
    engine,
    bpm: engine === "dnb" || engine === "jungle" ? 174 : engine === "grime" ? 140 : 132,
    duration: 30,
    plays: Math.max(0, 20000 - i * 113),
    likes: Math.max(0, 900 - i * 9),
    uploadedAt: released || new Date().toISOString(),
    description: `${artist} — ${t.title}. 30-second licensed preview. One bag: WAV, MP3 or FLAC on Beatport or Bandcamp.`,
    tracklist: [{ t: 0, title: `${artist} — ${t.title}` }],
    comments: [],
    tags: [genre.toLowerCase(), "catalogue"],
    seed: t.id,
    streamUrl: t.preview,
    credit: "30s preview via Deezer. Full file on Beatport / Bandcamp — WAV, MP3 or FLAC, one bag.",
    featured: i < 4,
    beatportUrl: beatportSearch(t.title, artist),
    spotifyUrl: spotifySearch(t.title, artist),
    bandcampUrl: bandcampSearch(t.title, artist),
    cut,
    label,
  };
}

async function deezerSearch(q: string, limit = 25): Promise<DeezerTrack[]> {
  const res = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: DeezerTrack[] };
  return json.data ?? [];
}

async function deezerTrack(id: string): Promise<DeezerTrack | null> {
  const res = await fetch(`https://api.deezer.com/track/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return (await res.json()) as DeezerTrack;
}

export function crateForSlug(slug: string) {
  return GENRE_CRATES.find((c) => c.slug === slug);
}

export const searchCatalogue = createServerFn({ method: "GET" })
  .validator((d: { q: string }) => d)
  .handler(async ({ data }): Promise<Mix[]> => {
    const q = data.q.trim();
    if (q.length < 2) return [];
    const crate = GENRE_CRATES.find(
      (c) => c.slug === q.toLowerCase() || c.name.toLowerCase() === q.toLowerCase(),
    );
    const tracks = await deezerSearch(crate?.q ?? q, 30);
    return tracks
      .map((t, i) => trackToMix(t, crate?.name ?? "UK", crate?.engine ?? "ukg", i))
      .filter((m): m is Mix => Boolean(m))
      .slice(0, 24);
  });

export const loadGenreReleases = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<{ name: string; mixes: Mix[] }> => {
    const crate = crateForSlug(data.slug) ?? {
      slug: data.slug,
      name: data.slug.replace(/-/g, " "),
      q: data.slug.replace(/-/g, " "),
      engine: "ukg" as EngineGenre,
    };
    const tracks = await deezerSearch(crate.q, 30);
    return {
      name: crate.name,
      mixes: tracks
        .map((t, i) => trackToMix(t, crate.name, crate.engine, i, `g-${crate.slug}`))
        .filter((m): m is Mix => Boolean(m)),
    };
  });

export const loadNewReleases = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ slug: string; name: string; mixes: Mix[] }[]> => {
    const lanes = GENRE_CRATES.filter((c) =>
      ["uk-garage", "drum-bass", "jungle", "grime", "bassline", "techno"].includes(c.slug),
    );
    const packs = await Promise.all(
      lanes.map(async (c) => {
        const tracks = await deezerSearch(c.q, 12);
        return {
          slug: c.slug,
          name: c.name,
          mixes: tracks
            .map((t, i) => trackToMix(t, c.name, c.engine, i, `g-${c.slug}`))
            .filter((m): m is Mix => Boolean(m))
            .slice(0, 8),
        };
      }),
    );
    return packs.filter((p) => p.mixes.length);
  },
);

export const loadCatalogueTrack = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<Mix | null> => {
    const m = String(id).match(/(\d+)$/);
    if (!m) return null;
    const t = await deezerTrack(m[1]!);
    if (!t) return null;
    const genre =
      GENRE_CRATES.find((c) => id.includes(c.slug) || id.includes(c.engine))?.name ?? "UK";
    const engine =
      GENRE_CRATES.find((c) => id.includes(c.slug) || id.includes(`-${c.engine}-`))?.engine ?? "ukg";
    const mix = trackToMix(t, genre, engine, 0, "dz", { skipFresh: true, requirePreview: false });
    if (mix) mix.id = id;
    return mix;
  });

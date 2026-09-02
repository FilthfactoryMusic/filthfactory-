import { createServerFn } from "@tanstack/react-start";
import type { Mix } from "./types";

type DeezerTrack = {
  id: number;
  title: string;
  preview: string;
  artist: { name: string };
  album?: { cover_medium?: string; cover_xl?: string };
};

function beatportSearch(title: string, artist: string) {
  return `https://www.beatport.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
}

function asMix(t: DeezerTrack, follow: string, i: number): Mix | null {
  if (!t.preview) return null;
  return {
    id: `bag-${t.id}`,
    title: t.title,
    djId: "",
    show: t.artist.name,
    artwork: t.album?.cover_xl || t.album?.cover_medium || "/art/brand/logo.png",
    city: "UK",
    citySlug: "london",
    genres: ["UK Garage"],
    engine: "ukg",
    bpm: 132,
    duration: 30,
    plays: Math.max(0, 9000 - i * 40),
    likes: 0,
    uploadedAt: new Date().toISOString(),
    description: `From your Beatport bag: ${follow}. 30s preview. Full release on Beatport / Spotify.`,
    tracklist: [{ t: 0, title: `${t.artist.name} — ${t.title}` }],
    comments: [],
    tags: [follow.toLowerCase(), "bag"],
    seed: t.id,
    streamUrl: t.preview,
    credit: `Follow: ${follow} · 30s preview · Beatport / Spotify for the full track`,
    beatportUrl: beatportSearch(t.title, t.artist.name),
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${t.artist.name} ${t.title}`)}`,
  };
}

export const SUGGESTED_FOLLOWS = [
  "Hospital Records",
  "Critical Music",
  "Ram Records",
  "UKF",
  "Soulvent",
  "Defected",
  "Night Bass",
  "Butterz",
  "Hyperdub",
  "Chase & Status",
  "Nia Archives",
  "NOTION",
  "Interplanetary Criminal",
  "Dimension",
];

export const loadBagReleases = createServerFn({ method: "GET" })
  .validator((d: { names: string[] }) => d)
  .handler(async ({ data }) => {
    const names = [...new Set(data.names.map((n) => n.trim()).filter(Boolean))].slice(0, 12);
    const mixes: Mix[] = [];
    const seen = new Set<number>();
    for (const name of names) {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(name)}&order=ranking&limit=6`;
      try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) continue;
        const json = (await res.json()) as { data?: DeezerTrack[] };
        for (const t of json.data ?? []) {
          if (seen.has(t.id)) continue;
          seen.add(t.id);
          const mix = asMix(t, name, mixes.length);
          if (mix) mixes.push(mix);
        }
      } catch {
        /* skip a bad name */
      }
    }
    return { mixes: mixes.slice(0, 20) };
  });

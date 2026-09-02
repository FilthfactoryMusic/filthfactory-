import { createServerFn } from "@tanstack/react-start";

export type LivePick = {
  id: string;
  title: string;
  dj: string;
  genre: string;
  source: "youtube" | "mixcloud" | "tiktok";
  url: string;
  thumb: string;
  description: string;
};

const YT_CHANNELS: { id: string; name: string; genre: string; url: string }[] = [
  { id: "UCQRp7g7irivIUb4HdiU1KiQ", name: "Code Red Radio", genre: "Drum & Bass", url: "https://www.youtube.com/channel/UCQRp7g7irivIUb4HdiU1KiQ/live" },
  { id: "thames", name: "Thames Delta Radio", genre: "Jungle / DnB", url: "https://www.youtube.com/@ThamesDeltaRadio/live" },
  { id: "UColVASy4cKV9R_uLpbLWe-g", name: "Groove London", genre: "UK Garage / House", url: "https://www.youtube.com/channel/UColVASy4cKV9R_uLpbLWe-g/live" },
  { id: "rinse", name: "Rinse FM", genre: "Grime / UKG", url: "https://www.youtube.com/@RinseFM/live" },
  { id: "ukf", name: "UKF", genre: "Drum & Bass", url: "https://www.youtube.com/@UKF/live" },
  { id: "hospital", name: "Hospital Records", genre: "Drum & Bass", url: "https://www.youtube.com/@hospitalrecords/live" },
  { id: "mixmag", name: "Mixmag", genre: "House / Techno", url: "https://www.youtube.com/@mixmag/live" },
  { id: "boiler", name: "Boiler Room", genre: "Electronic", url: "https://www.youtube.com/@boilerroom/live" },
];

const MIX_QUERIES = [
  { q: "uk garage live", genre: "UK Garage" },
  { q: "drum and bass live", genre: "Drum & Bass" },
  { q: "jungle live uk", genre: "Jungle" },
  { q: "bassline uk live", genre: "Bassline" },
];

const TIKTOK: LivePick[] = [
  {
    id: "tt-ukg",
    title: "UK garage lives on TikTok",
    dj: "TikTok Live",
    genre: "UK Garage",
    source: "tiktok",
    url: "https://www.tiktok.com/search?q=uk%20garage%20dj%20live",
    thumb: "/art/mixes/peckham-street.jpg",
    description: "Open TikTok’s live search for UK garage DJs who just went up.",
  },
  {
    id: "tt-dnb",
    title: "Drum & bass lives on TikTok",
    dj: "TikTok Live",
    genre: "Drum & Bass",
    source: "tiktok",
    url: "https://www.tiktok.com/search?q=drum%20and%20bass%20dj%20live",
    thumb: "/art/mixes/foundry.jpg",
    description: "Open TikTok’s live search for DnB desks on now.",
  },
];

const TTL_MS = 30 * 60 * 1000;

async function html(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 FilthfactoryLiveScan/1.0" },
    redirect: "follow",
  });
  if (!res.ok) return "";
  return res.text();
}

function youtubePick(ch: (typeof YT_CHANNELS)[number], page: string): LivePick | null {
  const live = page.includes("isLiveNow") || page.includes('"isLive":true');
  if (!live) return null;
  const vid = page.match(/"videoId":"([A-Za-z0-9_-]{11})"/)?.[1];
  const title =
    page.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? `${ch.name} — live`;
  const thumb =
    page.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ??
    (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : "/art/venues/warehouse14.jpg");
  const url = vid ? `https://www.youtube.com/watch?v=${vid}` : ch.url;
  return {
    id: `yt-${ch.id}`,
    title: title.replace(/ - YouTube$/, ""),
    dj: ch.name,
    genre: ch.genre,
    source: "youtube",
    url,
    thumb,
    description: `${ch.name} is live on YouTube. ${ch.genre}.`,
  };
}

type MixcloudHit = {
  key?: string;
  name?: string;
  url?: string;
  created_time?: string;
  user?: { name?: string; username?: string };
  pictures?: { extra_large?: string; large?: string };
  tags?: { name?: string }[];
};

async function mixcloud(): Promise<LivePick[]> {
  const out: LivePick[] = [];
  const seen = new Set<string>();
  for (const { q, genre } of MIX_QUERIES) {
    try {
      const res = await fetch(
        `https://api.mixcloud.com/search/?q=${encodeURIComponent(q)}&type=cloudcast&limit=4`,
      );
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: MixcloudHit[] };
      for (const c of json.data ?? []) {
        const url = c.url ?? "";
        if (!url || seen.has(url)) continue;
        if (c.created_time) {
          const t = Date.parse(c.created_time);
          if (Number.isFinite(t) && Date.now() - t > 90 * 24 * 60 * 60 * 1000) continue;
        } else continue;
        seen.add(url);
        out.push({
          id: `mc-${c.key ?? url}`,
          title: c.name ?? "Mixcloud set",
          dj: c.user?.name ?? c.user?.username ?? "Mixcloud",
          genre,
          source: "mixcloud",
          url,
          thumb: c.pictures?.extra_large || c.pictures?.large || "/art/mixes/ancoats.jpg",
          description: `Fresh Mixcloud ${genre} from ${c.user?.name ?? "a UK selector"}.`,
        });
      }
    } catch {
      /* skip query */
    }
  }
  return out.slice(0, 8);
}

async function youtubeLives(): Promise<LivePick[]> {
  const picks: LivePick[] = [];
  for (const ch of YT_CHANNELS) {
    try {
      const page = await html(ch.url);
      const pick = youtubePick(ch, page);
      if (pick) picks.push(pick);
    } catch {
      /* channel offline / blocked */
    }
  }
  return picks;
}

async function persist(picks: LivePick[]) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(picks);
    await sql`
      insert into live_picks (id, payload, scanned_at)
      values ('current', ${payload}, now())
      on conflict (id) do update set payload = ${payload}, scanned_at = now()
    `;
  } catch {
    /* preview still returns in-memory */
  }
}

async function readCache(): Promise<{ picks: LivePick[]; at: number } | null> {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ payload: string; scanned_at: string }>`
      select payload, scanned_at from live_picks where id = 'current'
    `;
    const row = rows[0];
    if (!row) return null;
    return { picks: JSON.parse(row.payload) as LivePick[], at: +new Date(row.scanned_at) };
  } catch {
    return null;
  }
}

async function scanNow(): Promise<LivePick[]> {
  const [yt, mc] = await Promise.all([youtubeLives(), mixcloud()]);
  const picks = [...yt, ...mc];
  await persist(picks);
  return picks;
}

export const loadJustLive = createServerFn({ method: "GET" }).handler(async () => {
  const cached = await readCache();
  if (cached && Date.now() - cached.at < TTL_MS && cached.picks.length) {
    return { picks: cached.picks, scannedAt: cached.at, stale: false };
  }
  const picks = await scanNow();
  return { picks, scannedAt: Date.now(), stale: false };
});

export const refreshJustLive = createServerFn({ method: "POST" }).handler(async () => {
  const picks = await scanNow();
  return { picks, scannedAt: Date.now(), stale: false };
});

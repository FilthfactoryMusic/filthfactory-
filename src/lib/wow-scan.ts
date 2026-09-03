import { createServerFn } from "@tanstack/react-start";
import { UK_BASS_LABELS, WOW_NEWS_LABELS } from "@/lib/uk-bass-labels";

export type WowKind = "artist" | "mix" | "news" | "label" | "festival";

export type WowItem = {
  id: string;
  kind: WowKind;
  name: string;
  title: string;
  blurb: string;
  url: string;
  source: string;
  publishedAt: string;
  thumb?: string;
  genre: string;
};

export type WowDigest = {
  dayId: string;
  items: WowItem[];
  scannedAt: number;
};

const FRESH_MS = 90 * 24 * 60 * 60 * 1000;

export const WOW_ARTISTS: { name: string; genre: string; news: string; needles: string[]; mixcloud: string; deezer: string }[] = [
  { name: "DJ EZ", genre: "UK Garage", news: '"DJ EZ" garage', needles: ["dj ez", "djez"], mixcloud: "DJ EZ", deezer: "DJ EZ" },
  { name: "Champion", genre: "UK Garage", news: '"Champion" DJ garage UK', needles: ["champion"], mixcloud: "Champion UK garage", deezer: "Champion" },
  { name: "DJ Q", genre: "Bassline", news: '"DJ Q" bassline Sheffield', needles: ["dj q", "bassline"], mixcloud: "DJ Q bassline", deezer: "DJ Q" },
  { name: "Conducta", genre: "UK Garage", news: "Conducta DJ garage", needles: ["conducta"], mixcloud: "Conducta", deezer: "Conducta" },
  { name: "Sammy Virji", genre: "UK Garage", news: '"Sammy Virji"', needles: ["sammy virji"], mixcloud: "Sammy Virji", deezer: "Sammy Virji" },
  { name: "Interplanetary Criminal", genre: "UK Garage", news: '"Interplanetary Criminal"', needles: ["interplanetary criminal"], mixcloud: "Interplanetary Criminal", deezer: "Interplanetary Criminal" },
  { name: "MJ Cole", genre: "UK Garage", news: '"MJ Cole" garage', needles: ["mj cole"], mixcloud: "MJ Cole", deezer: "MJ Cole" },
  { name: "Hamdi", genre: "Bassline", news: "Hamdi DJ bass UK", needles: ["hamdi"], mixcloud: "Hamdi", deezer: "Hamdi" },
  { name: "Novelist", genre: "Grime", news: '"Novelist" grime', needles: ["novelist"], mixcloud: "Novelist grime", deezer: "Novelist" },
  { name: "JME", genre: "Grime", news: "JME grime Boy Better Know", needles: ["jme"], mixcloud: "JME", deezer: "JME" },
  { name: "D Double E", genre: "Grime", news: '"D Double E"', needles: ["d double e"], mixcloud: "D Double E", deezer: "D Double E" },
  { name: "Ghetts", genre: "Grime", news: "Ghetts grime", needles: ["ghetts"], mixcloud: "Ghetts", deezer: "Ghetts" },
  { name: "Flowdan", genre: "Grime", news: "Flowdan grime", needles: ["flowdan"], mixcloud: "Flowdan", deezer: "Flowdan" },
  { name: "Ocean Wisdom", genre: "UK rap", news: '"Ocean Wisdom"', needles: ["ocean wisdom"], mixcloud: "Ocean Wisdom", deezer: "Ocean Wisdom" },
  { name: "Andy C", genre: "Drum & Bass", news: '"Andy C" drum and bass', needles: ["andy c"], mixcloud: "Andy C", deezer: "Andy C" },
  { name: "DJ Hype", genre: "Drum & Bass", news: '"DJ Hype" drum and bass', needles: ["dj hype"], mixcloud: "DJ Hype", deezer: "DJ Hype" },
  { name: "Zinc", genre: "Drum & Bass", news: '"DJ Zinc" OR Zinc drum and bass', needles: ["zinc"], mixcloud: "DJ Zinc", deezer: "DJ Zinc" },
  { name: "Nia Archives", genre: "Jungle", news: '"Nia Archives"', needles: ["nia archives"], mixcloud: "Nia Archives", deezer: "Nia Archives" },
  { name: "Sherelle", genre: "Jungle", news: "Sherelle DJ jungle", needles: ["sherelle"], mixcloud: "Sherelle", deezer: "Sherelle" },
  { name: "Selecta J-Man", genre: "Drum & Bass", news: '"Selecta J-Man" OR "J Man" jungle', needles: ["j-man", "j man"], mixcloud: "Selecta J-Man", deezer: "Selecta J-Man" },
  { name: "Eats Everything", genre: "Tech House", news: '"Eats Everything" DJ', needles: ["eats everything"], mixcloud: "Eats Everything", deezer: "Eats Everything" },
  { name: "Prospa", genre: "Tech House", news: "Prospa DJ house UK", needles: ["prospa"], mixcloud: "Prospa", deezer: "Prospa" },
];

export const WOW_LABELS = UK_BASS_LABELS;

export const WOW_GENRES: { id: string; name: string; news: string; needles: string[]; mixcloud: string; deezer: string }[] = [
  { id: "ukg", name: "UK Garage", news: "UK garage DJ 2026", needles: ["garage", "ukg", "2-step"], mixcloud: "uk garage 2026", deezer: "UK garage" },
  { id: "dnb", name: "Drum & Bass", news: "drum and bass UK 2026", needles: ["drum and bass", "dnb"], mixcloud: "drum and bass 2026", deezer: "drum and bass" },
  { id: "grime", name: "Grime", news: "UK grime 2026", needles: ["grime"], mixcloud: "grime uk 2026", deezer: "grime" },
  { id: "bassline", name: "Bassline", news: "UK bassline 2026", needles: ["bassline"], mixcloud: "bassline uk 2026", deezer: "bassline" },
  { id: "140", name: "140", news: "140 UK bass 2026", needles: ["140"], mixcloud: "140 bass uk", deezer: "140 bass" },
  { id: "tech-house", name: "Tech House", news: "tech house UK 2026", needles: ["tech house"], mixcloud: "tech house uk 2026", deezer: "tech house" },
  { id: "jungle", name: "Jungle", news: "jungle music UK 2026", needles: ["jungle"], mixcloud: "jungle uk 2026", deezer: "jungle" },
];

const DENY = ["nhs", "hse", "medical", "hospital trust", "hallucination", "clancy", "football", "premier league"];

function londonDayId(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}-v4`;
}

export function isFresh(dateStr?: string) {
  if (!dateStr) return false;
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= FRESH_MS;
}

function deny(title: string) {
  const t = title.toLowerCase();
  return DENY.some((d) => t.includes(d));
}

function hits(title: string, needles: string[]) {
  const t = title.toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

function decode(xml: string) {
  return xml
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRss(xml: string) {
  const out: { title: string; link: string; date: string; source: string }[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  for (const b of blocks) {
    const title = decode((b.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "").trim();
    const link = decode((b.match(/<link>([\s\S]*?)<\/link>/) ?? [])[1] ?? "").trim();
    const date = decode((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ?? [])[1] ?? "").trim();
    const source = decode((b.match(/<source[^>]*>([\s\S]*?)<\/source>/) ?? [])[1] ?? "News").trim();
    if (title && link) out.push({ title, link, date, source });
  }
  return out;
}

async function googleNews(query: string) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
  const res = await fetch(url, { headers: { "User-Agent": "FilthfactoryWOW/1.0" } });
  if (!res.ok) return [];
  return parseRss(await res.text()).filter((n) => isFresh(n.date) && !deny(n.title));
}

type MixHit = {
  key?: string;
  name?: string;
  url?: string;
  user?: { name?: string };
  created_time?: string;
  pictures?: { extra_large?: string; large?: string };
};

type DeezerArtist = {
  id: number;
  name: string;
  picture_xl?: string;
  picture_medium?: string;
  link?: string;
};

async function mixcloud(q: string): Promise<MixHit[]> {
  try {
    const res = await fetch(
      `https://api.mixcloud.com/search/?q=${encodeURIComponent(q)}&type=cloudcast&limit=5`,
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: MixHit[] };
    return (json.data ?? []).filter((m) => isFresh(m.created_time));
  } catch {
    return [];
  }
}

async function deezerArtists(q: string): Promise<DeezerArtist[]> {
  try {
    const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=8`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: DeezerArtist[] };
    return (json.data ?? []).filter((a) => a.picture_medium || a.picture_xl);
  } catch {
    return [];
  }
}

function songkick(name: string) {
  return `https://www.songkick.com/search?query=${encodeURIComponent(name)}`;
}

async function scanNow(dayId: string): Promise<WowItem[]> {
  const items: WowItem[] = [];
  const seen = new Set<string>();

  function push(it: WowItem) {
    const k = it.url || it.id;
    if (seen.has(k) || deny(it.title)) return;
    seen.add(k);
    items.push(it);
  }

  const artistPacks = await Promise.all(
    WOW_ARTISTS.map(async (a) => {
      try {
        const [faces, news, mixes] = await Promise.all([
          deezerArtists(a.deezer),
          googleNews(a.news),
          mixcloud(a.mixcloud),
        ]);
        const n = a.name.toLowerCase();
        const face =
          faces.find((f) => f.name.toLowerCase() === n) ??
          faces.find((f) => f.name.toLowerCase().startsWith(n)) ??
          faces.find((f) => f.name.toLowerCase().includes(n.split(" ")[0]!)) ??
          faces[0];
        return { a, face, news, mixes };
      } catch {
        return { a, face: undefined, news: [] as Awaited<ReturnType<typeof googleNews>>, mixes: [] as MixHit[] };
      }
    }),
  );

  for (const { a, face, news, mixes } of artistPacks) {
    push({
      id: `face-${a.name}`,
      kind: "artist",
      name: a.name,
      title: a.name,
      blurb: a.genre,
      url: face?.link || songkick(a.name),
      source: "Artist",
      publishedAt: dayId,
      thumb: face?.picture_xl || face?.picture_medium,
      genre: a.genre,
    });
    const hit = news.find((n) => hits(n.title, a.needles));
    if (hit) {
      push({
        id: `news-${a.name}-${hit.link}`,
        kind: "news",
        name: a.name,
        title: hit.title,
        blurb: `${a.genre} · ${hit.source}`,
        url: hit.link,
        source: hit.source,
        publishedAt: hit.date,
        thumb: face?.picture_medium,
        genre: a.genre,
      });
    }
    const mix = mixes[0];
    if (mix?.url) {
      push({
        id: `mc-${mix.key ?? mix.url}`,
        kind: "mix",
        name: a.name,
        title: mix.name ?? `${a.name} mix`,
        blurb: `Dropped ${mix.created_time?.slice(0, 10) ?? "recently"}`,
        url: mix.url,
        source: "Mixcloud",
        publishedAt: mix.created_time ?? dayId,
        thumb: mix.pictures?.extra_large || mix.pictures?.large || face?.picture_medium,
        genre: a.genre,
      });
    }
  }

  for (const lab of WOW_NEWS_LABELS) {
    try {
      const [faces, news] = await Promise.all([deezerArtists(lab.deezer), googleNews(lab.news!)]);
      const hit = news.find((n) => hits(n.title, lab.needles ?? []));
      push({
        id: `lab-${lab.name}`,
        kind: "label",
        name: lab.name,
        title: hit?.title ?? lab.name,
        blurb: hit ? hit.source : "UK label desk",
        url: hit?.link ?? lab.site,
        source: hit?.source ?? "Label",
        publishedAt: hit?.date ?? dayId,
        thumb: lab.logo || faces[0]?.picture_xl || faces[0]?.picture_medium,
        genre: "Label",
      });
    } catch {
      /* skip */
    }
  }

  for (const g of WOW_GENRES) {
    try {
      const [news, mixes] = await Promise.all([
        googleNews(g.news),
        mixcloud(g.mixcloud),
      ]);
      const hit = news.find((n) => hits(n.title, g.needles));
      if (hit) {
        push({
          id: `gnews-${g.id}`,
          kind: "news",
          name: g.name,
          title: hit.title,
          blurb: hit.source,
          url: hit.link,
          source: hit.source,
          publishedAt: hit.date,
          genre: g.name,
        });
      }
      const mixUrl = mixes[0]?.url;
      if (mixUrl) {
        const m = mixes[0]!;
        push({
          id: `gmc-${g.id}-${m.key ?? mixUrl}`,
          kind: "mix",
          name: m.user?.name ?? g.name,
          title: m.name ?? g.name,
          blurb: g.name,
          url: mixUrl,
          source: "Mixcloud",
          publishedAt: m.created_time || dayId,
          thumb: m.pictures?.extra_large || m.pictures?.large,
          genre: g.name,
        });
      }
    } catch {
      /* next */
    }
  }

  return items.slice(0, 60);
}

async function persist(dayId: string, items: WowItem[]) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(items);
    await sql`
      insert into wow_digest (day_id, payload, scanned_at)
      values (${dayId}, ${payload}, now())
      on conflict (day_id) do update set payload = ${payload}, scanned_at = now()
    `;
  } catch {
    /* in-memory ok */
  }
}

async function readDay(dayId: string) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ payload: string; scanned_at: string }>`
      select payload, scanned_at from wow_digest where day_id = ${dayId}
    `;
    const row = rows[0];
    if (!row) return null;
    return { items: JSON.parse(row.payload) as WowItem[], scannedAt: +new Date(row.scanned_at) };
  } catch {
    return null;
  }
}

export const loadWow = createServerFn({ method: "GET" }).handler(async (): Promise<WowDigest> => {
  const dayId = londonDayId();
  const cached = await readDay(dayId);
  if (cached?.items.length) return { dayId, items: cached.items, scannedAt: cached.scannedAt };
  const items = await scanNow(dayId);
  await persist(dayId, items);
  return { dayId, items, scannedAt: Date.now() };
});

export const refreshWow = createServerFn({ method: "POST" }).handler(async (): Promise<WowDigest> => {
  const dayId = londonDayId();
  const items = await scanNow(dayId);
  await persist(dayId, items);
  return { dayId, items, scannedAt: Date.now() };
});

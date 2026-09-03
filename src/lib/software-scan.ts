import { createServerFn } from "@tanstack/react-start";

export type SoftDeskId = "rekordbox" | "serato" | "engine";

export type SoftItem = {
  id: string;
  desk: SoftDeskId;
  title: string;
  blurb: string;
  url: string;
  publishedAt: string;
};

export type SoftDesk = {
  id: SoftDeskId;
  name: string;
  blurb: string;
  site: string;
  download: string;
  logo: string;
};

export type SoftDigest = {
  dayId: string;
  items: SoftItem[];
  scannedAt: number;
};

export const SOFT_DESKS: SoftDesk[] = [
  {
    id: "rekordbox",
    name: "rekordbox",
    blurb: "Pioneer DJ. Export, HID, CDJ/XDJ, streaming.",
    site: "https://rekordbox.com/en/support/information/",
    download: "https://rekordbox.com/en/download/",
    logo: "/art/software/rekordbox.png",
  },
  {
    id: "serato",
    name: "Serato DJ",
    blurb: "Serato DJ Pro / Lite. Stems, DVS, library.",
    site: "https://the-drop.serato.com/",
    download: "https://serato.com/dj/pro/downloads",
    logo: "/art/software/serato.png",
  },
  {
    id: "engine",
    name: "Engine DJ",
    blurb: "Denon / Rane standalone. Stems, OS, desktop.",
    site: "https://enginedj.com/news",
    download: "https://enginedj.com/downloads",
    logo: "/art/software/engine.png",
  },
];

function londonDayId(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `software-${get("year")}-${get("month")}-${get("day")}`;
}

function decode(xml: string) {
  return xml
    .replace(/<!\[CDATA\[([\s\S]*?)]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "FilthfactorySoft/1.0", Accept: "text/html,application/rss+xml" },
  });
  if (!res.ok) return "";
  return res.text();
}

function parseRss(xml: string) {
  const out: { title: string; link: string; date: string }[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  for (const b of blocks) {
    const title = decode((b.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "");
    const link = decode((b.match(/<link>([\s\S]*?)<\/link>/) ?? [])[1] ?? "");
    const date = decode((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ?? [])[1] ?? "");
    if (title && link) out.push({ title, link, date });
  }
  return out;
}

async function googleNews(query: string) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
  try {
    return parseRss(await fetchText(url)).slice(0, 8);
  } catch {
    return [];
  }
}

function slugTitle(slug: string) {
  return slug
    .replace(/engine-dj/gi, "Engine DJ")
    .replace(/serato/gi, "Serato")
    .replace(/macos/gi, "macOS")
    .replace(/[-_]+/g, " ")
    .replace(/\bDj\b/g, "DJ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bDj\b/g, "DJ")
    .trim();
}

async function rekordboxOfficial(): Promise<SoftItem[]> {
  const html = await fetchText("https://rekordbox.com/en/support/information/");
  const items: SoftItem[] = [];
  const re = /rekordbox ver\.\s*([\d.]+)\s+has been released/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(html))) {
    const ver = m[1]!;
    if (seen.has(ver)) continue;
    seen.add(ver);
    items.push({
      id: `rb-${ver}`,
      desk: "rekordbox",
      title: `rekordbox ${ver} released`,
      blurb: "Official Pioneer DJ / rekordbox update notes.",
      url: "https://rekordbox.com/en/support/information/",
      publishedAt: new Date().toISOString(),
    });
  }
  return items.slice(0, 6);
}

async function seratoOfficial(): Promise<SoftItem[]> {
  const html = await fetchText("https://the-drop.serato.com/");
  const hrefs = [...html.matchAll(/href="(https:\/\/the-drop\.serato\.com\/(?:announcements|how-to)\/[^"#]+\/)"/g)].map(
    (x) => x[1]!,
  );
  const unique = [...new Set(hrefs)].slice(0, 8);
  return unique.map((url) => {
    const slug = url.split("/").filter(Boolean).pop() ?? "post";
    return {
      id: `se-${slug}`,
      desk: "serato" as const,
      title: slugTitle(slug),
      blurb: "From The Drop — Serato.",
      url,
      publishedAt: new Date().toISOString(),
    };
  });
}

async function engineOfficial(): Promise<SoftItem[]> {
  const html = await fetchText("https://enginedj.com/news");
  const hrefs = [...html.matchAll(/href="(\/news\/articles\/[^"]+)"/g)].map((x) => x[1]!);
  const unique = [...new Set(hrefs)].slice(0, 8);
  return unique.map((path) => {
    const slug = path.split("/").pop() ?? "article";
    return {
      id: `en-${slug}`,
      desk: "engine" as const,
      title: slugTitle(slug),
      blurb: "Official Engine DJ / Denon news.",
      url: `https://enginedj.com${path}`,
      publishedAt: new Date().toISOString(),
    };
  });
}

const NEWS_Q: Record<SoftDeskId, string> = {
  rekordbox: 'rekordbox (update OR released OR version OR "ver.") (Pioneer OR CDJ)',
  serato: '"Serato DJ" (Pro OR Lite OR update OR library OR Stems)',
  engine: '"Engine DJ" (update OR version OR stems OR Denon OR Rane)',
};

async function scanNow(): Promise<SoftItem[]> {
  const items: SoftItem[] = [];
  const seen = new Set<string>();
  function push(it: SoftItem) {
    const k = it.url + it.title;
    if (seen.has(k)) return;
    seen.add(k);
    items.push(it);
  }

  const [rb, se, en, gRb, gSe, gEn] = await Promise.all([
    rekordboxOfficial().catch(() => [] as SoftItem[]),
    seratoOfficial().catch(() => [] as SoftItem[]),
    engineOfficial().catch(() => [] as SoftItem[]),
    googleNews(NEWS_Q.rekordbox),
    googleNews(NEWS_Q.serato),
    googleNews(NEWS_Q.engine),
  ]);

  for (const it of [...rb, ...se, ...en]) push(it);

  const extra: [SoftDeskId, { title: string; link: string; date: string }[]][] = [
    ["rekordbox", gRb],
    ["serato", gSe],
    ["engine", gEn],
  ];
  for (const [desk, rows] of extra) {
    for (const n of rows.slice(0, 5)) {
      push({
        id: `${desk}-g-${n.link}`,
        desk,
        title: n.title.replace(/\s*-\s*[^-]+$/, "").trim() || n.title,
        blurb: "Software news.",
        url: n.link,
        publishedAt: n.date || new Date().toISOString(),
      });
    }
  }
  return items;
}

let memory: SoftDigest | null = null;

async function persist(dayId: string, items: SoftItem[]) {
  memory = { dayId, items, scannedAt: Date.now() };
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
    /* memory ok */
  }
}

async function readDay(dayId: string): Promise<SoftDigest | null> {
  if (memory?.dayId === dayId && memory.items.length) return memory;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ payload: string; scanned_at: string }>`
      select payload, scanned_at from wow_digest where day_id = ${dayId}
    `;
    const row = rows[0];
    if (!row) return null;
    return { dayId, items: JSON.parse(row.payload) as SoftItem[], scannedAt: +new Date(row.scanned_at) };
  } catch {
    return null;
  }
}

export const loadSoftware = createServerFn({ method: "GET" }).handler(async (): Promise<SoftDigest> => {
  const dayId = londonDayId();
  const cached = await readDay(dayId);
  if (cached?.items.length) return cached;
  const items = await scanNow();
  await persist(dayId, items);
  return { dayId, items, scannedAt: Date.now() };
});

export const refreshSoftware = createServerFn({ method: "POST" }).handler(async (): Promise<SoftDigest> => {
  const dayId = londonDayId();
  const items = await scanNow();
  await persist(dayId, items);
  return { dayId, items, scannedAt: Date.now() };
});

import { UK_BASS_LABELS } from "@/lib/uk-bass-labels";

export type Brand = {
  name: string;
  logo: string;
  site: string;
  aliases: string[];
};

const EXTRA: Brand[] = [
  {
    name: "Filthfactory",
    logo: "/art/brand/logo.png",
    site: "/",
    aliases: ["filthfactory", "filth factory", "filth factory music"],
  },
  {
    name: "rekordbox",
    logo: "/art/software/rekordbox.png",
    site: "https://rekordbox.com/en/support/information/",
    aliases: ["rekordbox"],
  },
  {
    name: "Serato DJ",
    logo: "/art/software/serato.png",
    site: "https://the-drop.serato.com/",
    aliases: ["serato dj", "serato"],
  },
  {
    name: "Engine DJ",
    logo: "/art/software/engine.png",
    site: "https://enginedj.com/news",
    aliases: ["engine dj"],
  },
];

export const BRANDS: Brand[] = (() => {
  const out: Brand[] = [];
  const seen = new Set<string>();
  function add(b: Brand) {
    const k = b.name.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push({
      ...b,
      aliases: [...new Set([b.name.toLowerCase(), ...b.aliases.map((a) => a.toLowerCase())])].sort(
        (a, c) => c.length - a.length,
      ),
    });
  }
  for (const e of EXTRA) add(e);
  for (const l of UK_BASS_LABELS) {
    add({
      name: l.name,
      logo: l.logo,
      site: l.site,
      aliases: [l.name, ...(l.needles ?? [])],
    });
  }
  return out.sort((a, b) => b.name.length - a.name.length);
})();

const ALIAS_INDEX: { alias: string; brand: Brand }[] = BRANDS.flatMap((b) =>
  b.aliases.map((alias) => ({ alias, brand: b })),
).sort((a, b) => b.alias.length - a.alias.length);

const BRAND_RE = new RegExp(`\\b(${ALIAS_INDEX.map((x) => x.alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

export function findBrand(name: string): Brand | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  const exact = BRANDS.find((b) => b.name.toLowerCase() === n || b.aliases.includes(n));
  if (exact) return exact;
  return ALIAS_INDEX.find((x) => n.includes(x.alias))?.brand ?? null;
}

export type BrandPart = { text: string; brand?: Brand };

export function splitBrands(text: string): BrandPart[] {
  if (!text) return [];
  const parts: BrandPart[] = [];
  let last = 0;
  const re = new RegExp(BRAND_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    const hit = m[1] ?? m[0];
    const brand = findBrand(hit);
    if (brand) parts.push({ text: hit, brand });
    else parts.push({ text: hit });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts.length ? parts : [{ text }];
}

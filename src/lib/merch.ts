export type MerchSku = {
  id: string;
  name: string;
  blurb: string;
  pence: number;
  image: string;
};

export const FACTORY_MERCH: MerchSku[] = [
  { id: "hoodie", name: "Stamp hoodie", blurb: "Black. Factory on the chest. The one in the photo.", pence: 4800, image: "/art/merch/hoodie.jpg" },
  { id: "tee", name: "Stamp tee", blurb: "Black. White factory print.", pence: 2800, image: "/art/merch/tee.jpg" },
  { id: "beanie", name: "Stamp beanie", blurb: "Black. Factory on the front.", pence: 1800, image: "/art/merch/beanie.jpg" },
];

export const FACTORY_IG = "parosite";
export const FACTORY_TIKTOK = "filthfactorymusic";
export const DROP_SHOT = "/art/merch/drop.jpg";

export function merchById(id: string) {
  return FACTORY_MERCH.find((m) => m.id === id) ?? null;
}

/** Public Instagram profiles we link to. We do not scrape posts or sell their stock. */
export const LABEL_INSTAGRAM: Record<string, string> = {
  "Hospital Records": "hospitalrecords",
  "Born on Road": "bornonroad",
  Crucast: "crucast",
  "Low Down Deep": "lowdowndeep",
  "High Focus": "highfocusrecords",
  "3000 Bass": "3000bass",
  "Garage Shared": "garageshared",
  "Skank and Bass": "skankandbass",
  "Critical Music": "criticalmusic",
  "RAM Records": "ramrecords",
  "Shogun Audio": "shogunaudio",
  Metalheadz: "metalheadz",
  "Soulvent Records": "soulventrecords",
  "1985 Music": "1985music",
  "Flexout Audio": "flexoutaudio",
  "Viper Recordings": "viperrecordings",
  "Deep Medi": "deepmedi",
  Butterz: "butterz",
  Hyperdub: "hyperdub",
  "Night Slugs": "nightslugs",
  Rinse: "rinsefm",
  "Deep Dark & Dangerous": "deepdarkanddangerous",
  "White Peach": "whitepeachrecords",
  "Local Action": "localactionrecords",
  Playaz: "playaz",
};

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

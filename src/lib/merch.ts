export type MerchKind = "tee" | "hoodie" | "beanie" | "snapback" | "keyring";

export type MerchSku = {
  id: string;
  name: string;
  blurb: string;
  pence: number;
  image: string;
  kind: MerchKind;
  color: string;
  swatch: string;
};

export const FACTORY_MERCH: MerchSku[] = [
  { id: "tee-black", name: "Factory tee", blurb: "Black heavyweight. Circle stamp, left chest.", pence: 2800, image: "/art/merch/tee-black.jpg?v=onchest", kind: "tee", color: "Black", swatch: "#111111" },
  { id: "tee-black-center", name: "Factory tee", blurb: "Black heavyweight. Circle stamp, center.", pence: 2800, image: "/art/merch/tee-black-center.jpg?v=onchest", kind: "tee", color: "Black center", swatch: "#111111" },
  { id: "tee-white", name: "Factory tee", blurb: "White heavyweight. Circle stamp, left chest.", pence: 2800, image: "/art/merch/tee-white.jpg?v=onchest", kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "tee-grey", name: "Factory tee", blurb: "Heather. Circle stamp.", pence: 2800, image: "/art/merch/tee-grey.jpg?v=onchest", kind: "tee", color: "Grey", swatch: "#8a8a86" },
  { id: "tee-olive", name: "Factory tee", blurb: "Olive. Circle stamp.", pence: 2800, image: "/art/merch/tee-olive.jpg?v=onchest", kind: "tee", color: "Olive", swatch: "#4a5a32" },
  { id: "hoodie-black", name: "Factory hoodie", blurb: "Black pullover. Circle stamp on the chest.", pence: 4800, image: "/art/merch/hoodie-black.jpg?v=onchest", kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "beanie-black", name: "Stamp beanie", blurb: "Black rib. Stamp on the cuff.", pence: 1800, image: "/art/merch/beanie-black.jpg", kind: "beanie", color: "Black", swatch: "#111111" },
  { id: "snapback-black", name: "Stamp snapback", blurb: "Black flat brim. Stamp on the front.", pence: 2200, image: "/art/merch/snapback-black.jpg", kind: "snapback", color: "Black", swatch: "#111111" },
  { id: "keyring", name: "Stamp keyring", blurb: "Metal disc. The circle on your keys.", pence: 800, image: "/art/merch/keyring.jpg", kind: "keyring", color: "Steel", swatch: "#c4c4c0" },
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
  Anjunabeats: "anjunabeats",
  Anjunadeep: "anjunadeep",
  "Armada Music": "armadamusic",
  "A State of Trance": "asot",
  "Black Hole Recordings": "blackholerecordings",
  "Enhanced Music": "enhancedmusic",
  Vandit: "vanditrecords",
  Perfecto: "perfectorecords",
  "Tidy Trax": "tidyofficial",
  Nukleuz: "nukleuz",
};

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

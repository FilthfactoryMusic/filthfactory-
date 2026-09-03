export type MerchSku = {
  id: string;
  name: string;
  blurb: string;
  pence: number;
  image: string;
};

export const FACTORY_MERCH: MerchSku[] = [
  { id: "tee", name: "Stamp tee", blurb: "Black. The circle on the chest. Printed to order in the UK.", pence: 2800, image: "/art/merch/tee.png" },
  { id: "hoodie", name: "Stamp hoodie", blurb: "Heavyweight black. Stamp on the front.", pence: 4800, image: "/art/merch/hoodie.png" },
  { id: "tote", name: "Crate tote", blurb: "Natural canvas. Holds records.", pence: 1500, image: "/art/merch/tote.png" },
  { id: "slipmat", name: "Stamp slipmat", blurb: "12-inch felt. The circle on the platter.", pence: 1800, image: "/art/merch/slipmat.png" },
  { id: "stickers", name: "Stamp pack", blurb: "Three circle stickers. Phone, case, flyer.", pence: 600, image: "/art/merch/stickers.png" },
];

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

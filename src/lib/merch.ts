export type MerchKind =
  | "tee"
  | "hoodie"
  | "beanie"
  | "snapback"
  | "keyring"
  | "badge"
  | "sticker"
  | "lighter"
  | "mug"
  | "tote";

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

const V = "line3";

export const FACTORY_MERCH: MerchSku[] = [
  { id: "sil-tee-black", name: "Factory tee", blurb: "Original factory mark. White on black.", pence: 2000, image: `/art/merch/sil-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "sil-tee-white", name: "Factory tee", blurb: "Original factory mark. Black on white.", pence: 2000, image: `/art/merch/sil-tee-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "sil-tee-olive", name: "Factory tee", blurb: "Original factory mark. Black on olive.", pence: 2000, image: `/art/merch/sil-tee-olive.jpg?v=${V}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "sil-hoodie-black", name: "Factory hoodie", blurb: "Original factory mark. White on black.", pence: 4500, image: `/art/merch/sil-hoodie-black.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "sil-hoodie-white", name: "Factory hoodie", blurb: "Original factory mark. Black on white.", pence: 4500, image: `/art/merch/sil-hoodie-white.jpg?v=${V}`, kind: "hoodie", color: "White", swatch: "#f4f4f0" },
  { id: "sil-hoodie-olive", name: "Factory hoodie", blurb: "Original factory mark. Black on olive.", pence: 4500, image: `/art/merch/sil-hoodie-olive.jpg?v=${V}`, kind: "hoodie", color: "Olive", swatch: "#5c5a3a" },
  { id: "drip-tee-black", name: "Drip tee", blurb: "FILTH FACTORY bubble letters. White on black.", pence: 2000, image: `/art/merch/drip-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "drip-tee-olive", name: "Drip tee", blurb: "FILTH FACTORY bubble letters. White on olive.", pence: 2000, image: `/art/merch/drip-tee-olive.jpg?v=${V}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "drip-hoodie-black", name: "Drip hoodie", blurb: "FILTH FACTORY bubble letters. White on black.", pence: 4500, image: `/art/merch/drip-hoodie-black.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "tee-black", name: "Stamp tee", blurb: "Circle stamp, chest. Black blank.", pence: 2000, image: `/art/merch/tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "tee-white", name: "Stamp tee", blurb: "Circle stamp, chest. White blank.", pence: 2000, image: `/art/merch/tee-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "hoodie-black", name: "Stamp hoodie", blurb: "Circle stamp, chest. Black blank.", pence: 4500, image: `/art/merch/hoodie-black.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "hoodie-white", name: "Stamp hoodie", blurb: "Circle stamp, chest. White blank.", pence: 4500, image: `/art/merch/hoodie-white.jpg?v=${V}`, kind: "hoodie", color: "White", swatch: "#f4f4f0" },
  { id: "hoodie-olive", name: "Stamp hoodie", blurb: "Circle stamp, chest. Olive blank.", pence: 4500, image: `/art/merch/stamp-hoodie-olive.jpg?v=${V}`, kind: "hoodie", color: "Olive", swatch: "#5c5a3a" },
  { id: "beanie-black", name: "Stamp beanie", blurb: "Circle stamp on the cuff.", pence: 1800, image: `/art/merch/beanie.jpg?v=${V}`, kind: "beanie", color: "Black", swatch: "#111111" },
  { id: "snapback-black", name: "Stamp cap", blurb: "Circle stamp, front. Black snapback.", pence: 2500, image: `/art/merch/snapback-black.jpg?v=${V}`, kind: "snapback", color: "Black", swatch: "#111111" },
  { id: "tote-black", name: "Stamp tote", blurb: "Circle stamp, one side.", pence: 1500, image: `/art/merch/tote.jpg?v=${V}`, kind: "tote", color: "Black", swatch: "#111111" },
  { id: "mug-black", name: "Stamp mug", blurb: "Circle stamp on a black mug.", pence: 1400, image: `/art/merch/mug.jpg?v=${V}`, kind: "mug", color: "Black", swatch: "#111111" },
  { id: "lighter-black", name: "Stamp lighter", blurb: "Circle stamp on a black case.", pence: 1200, image: `/art/merch/lighter.jpg?v=${V}`, kind: "lighter", color: "Black", swatch: "#111111" },
  { id: "badge", name: "Stamp badge", blurb: "Enamel disc. The circle.", pence: 600, image: `/art/merch/badge.jpg?v=${V}`, kind: "badge", color: "Steel", swatch: "#c4c4c0" },
  { id: "stickers", name: "Stamp stickers", blurb: "Die-cut circle pack.", pence: 500, image: `/art/merch/stickers.jpg?v=${V}`, kind: "sticker", color: "Pack", swatch: "#111111" },
  { id: "keyring", name: "Stamp keyring", blurb: "Metal disc. The circle on your keys.", pence: 800, image: `/art/merch/keyring.jpg?v=${V}`, kind: "keyring", color: "Steel", swatch: "#c4c4c0" },
];

const D = "d7";

export const CAMO_MERCH: MerchSku[] = [
  { id: "camo-hoodie-woodland", name: "Jungle hoodie", blurb: "Woodland camo. FILTH / FACTORY graffiti.", pence: 4500, image: `/art/merch/drafts/13-woodland-hoodie.jpg?v=${D}`, kind: "hoodie", color: "Woodland", swatch: "#4a5a32" },
  { id: "camo-tee-woodland", name: "Jungle tee", blurb: "Woodland camo. FILTH / FACTORY graffiti.", pence: 2000, image: `/art/merch/drafts/14-woodland-tee.jpg?v=${D}`, kind: "tee", color: "Woodland", swatch: "#4a5a32" },
  { id: "camo-hoodie-tiger", name: "Tiger hoodie", blurb: "Tigerstripe camo. FILTH / FACTORY graffiti.", pence: 4500, image: `/art/merch/drafts/15-tiger-hoodie.jpg?v=${D}`, kind: "hoodie", color: "Tiger", swatch: "#3d4a28" },
];

export const SPOOF_MERCH: MerchSku[] = [
  { id: "spoof-brokelads-black", name: "Brokelads tee", blurb: "Bookies fascia gag. Black.", pence: 2000, image: `/art/merch/drafts/tee-brokelads-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-brokelads-white", name: "Brokelads tee", blurb: "Bookies fascia gag. White.", pence: 2000, image: `/art/merch/drafts/tee-brokelads-white.jpg?v=${D}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-crack-black", name: "Crack Converters tee", blurb: "Pawn shop gag. Black.", pence: 2000, image: `/art/merch/drafts/tee-crack-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-crack-olive", name: "Crack Converters tee", blurb: "Pawn shop gag. Olive.", pence: 2000, image: `/art/merch/drafts/tee-crack-olive.jpg?v=${D}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "spoof-superdrugs-white", name: "Superdrugs tee", blurb: "Chemist gag. White.", pence: 2000, image: `/art/merch/drafts/tee-superdrugs-white.jpg?v=${D}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-superdrugs-hoodie", name: "Superdrugs hoodie", blurb: "Chemist gag. White hoodie.", pence: 4500, image: `/art/merch/drafts/hoodie-superdrugs-white.jpg?v=${D}`, kind: "hoodie", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-greggs-black", name: "Greggs Afters tee", blurb: "6am meat bake. Black.", pence: 2000, image: `/art/merch/drafts/tee-greggs-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-paddy-black", name: "Paddy Powder tee", blurb: "In-play all night. Black.", pence: 2000, image: `/art/merch/drafts/tee-paddy-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-gurnoff-black", name: "Gurnoff tee", blurb: "No filter just teeth. Black.", pence: 2000, image: `/art/merch/drafts/tee-gurnoff-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-gurnoff-olive", name: "Gurnoff tee", blurb: "No filter just teeth. Olive.", pence: 2000, image: `/art/merch/drafts/tee-gurnoff-olive.jpg?v=${D}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "spoof-silk-black", name: "Silk Cuts tee", blurb: "Purple pack gag. Black.", pence: 2000, image: `/art/merch/drafts/tee-silk-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-silk-white", name: "Silk Cuts tee", blurb: "Purple pack gag. White.", pence: 2000, image: `/art/merch/drafts/tee-silk-white.jpg?v=${D}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-stoned-black", name: "Stoned Island tee", blurb: "4am in the car park. Black.", pence: 2000, image: `/art/merch/drafts/tee-stoned-black.jpg?v=${D}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-stoned-white", name: "Stoned Island tee", blurb: "4am in the car park. White.", pence: 2000, image: `/art/merch/drafts/tee-stoned-white.jpg?v=${D}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-stoned-olive", name: "Stoned Island tee", blurb: "4am in the car park. Olive.", pence: 2000, image: `/art/merch/drafts/tee-stoned-olive.jpg?v=${D}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "spoof-stoned-hoodie", name: "Stoned Island hoodie", blurb: "4am in the car park. Black hoodie.", pence: 4500, image: `/art/merch/drafts/hoodie-stoned-black.jpg?v=${D}`, kind: "hoodie", color: "Black", swatch: "#111111" },
];

export const DROP_SHOT = "/art/merch/drop.jpg";

export function merchById(id: string) {
  return (
    FACTORY_MERCH.find((m) => m.id === id) ??
    SPOOF_MERCH.find((m) => m.id === id) ??
    CAMO_MERCH.find((m) => m.id === id) ??
    null
  );
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

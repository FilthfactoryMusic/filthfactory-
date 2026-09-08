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
  tag?: string;
};

const V = "line10";
const T = "tag1";

export function tagFor(kind: MerchKind, color: string) {
  if (kind === "beanie" || kind === "snapback") return `/art/merch/tags/beanie.jpg?v=${T}`;
  if (kind === "hoodie") return `/art/merch/tags/hoodie-black.jpg?v=${T}`;
  if (/white|acid|mint/i.test(color)) return `/art/merch/tags/tee-white.jpg?v=${T}`;
  return `/art/merch/tags/tee-black.jpg?v=${T}`;
}

export const CLASH_MERCH: MerchSku[] = [
  { id: "ug-leftchest-hoodie", name: "Left-chest hoodie", blurb: "Small factory on the left. Rest black.", pence: 4500, image: `/art/merch/ug-leftchest-hoodie.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "ug-olive-graff-hoodie", name: "Graffiti olive hoodie", blurb: "FILTHFACTORY graffiti. Olive drab.", pence: 4500, image: `/art/merch/ug-olive-graff-hoodie.jpg?v=${V}`, kind: "hoodie", color: "Olive", swatch: "#5c5a3a" },
  { id: "ug-flyer-tee", name: "Flyer tee", blurb: "Xerox jungle flyer. Hazard yellow on black.", pence: 2000, image: `/art/merch/ug-flyer-tee.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "ug-ecru-tee", name: "Ecru factory tee", blurb: "Black factory on cream.", pence: 2000, image: `/art/merch/ug-ecru-tee.jpg?v=${V}`, kind: "tee", color: "Ecru", swatch: "#e6dfd0" },
  { id: "ug-xerox-hoodie", name: "Xerox hoodie", blurb: "Faded FILTH. Charcoal.", pence: 4500, image: `/art/merch/ug-xerox-hoodie.jpg?v=${V}`, kind: "hoodie", color: "Charcoal", swatch: "#3a3a3a" },
  { id: "ug-navy-stripe-hoodie", name: "Workwear hoodie", blurb: "Yellow stripe. Navy.", pence: 4500, image: `/art/merch/ug-navy-stripe-hoodie.jpg?v=${V}`, kind: "hoodie", color: "Navy", swatch: "#1a1f2e" },
  { id: "stencil-tee-black", name: "Stencil tee", blurb: "White factory stencil. No box.", pence: 2000, image: `/art/merch/stencil-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spray-tee-black", name: "Can tee", blurb: "Spray can mark. Cropped.", pence: 2000, image: `/art/merch/spray-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
];

export const FACTORY_MERCH: MerchSku[] = [
  { id: "sil-tee-black", name: "Factory tee", blurb: "Factory mark. No box.", pence: 2000, image: `/art/merch/sil-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "sil-tee-white", name: "Factory tee", blurb: "Factory mark. No box.", pence: 2000, image: `/art/merch/sil-tee-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "sil-tee-olive", name: "Factory tee", blurb: "Factory mark. No box.", pence: 2000, image: `/art/merch/sil-tee-olive.jpg?v=${V}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "sil-hoodie-black", name: "Factory hoodie", blurb: "Factory mark. No box.", pence: 4500, image: `/art/merch/sil-hoodie-black.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "sil-hoodie-olive", name: "Factory hoodie", blurb: "Factory mark. No box.", pence: 4500, image: `/art/merch/sil-hoodie-olive.jpg?v=${V}`, kind: "hoodie", color: "Olive", swatch: "#5c5a3a" },
  { id: "drip-tee-black", name: "Drip tee", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 2000, image: `/art/merch/drip-tee-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "drip-tee-white", name: "Drip tee", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 2000, image: `/art/merch/drip-tee-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "drip-tee-olive", name: "Drip tee", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 2000, image: `/art/merch/drip-tee-olive.jpg?v=${V}`, kind: "tee", color: "Olive", swatch: "#5c5a3a" },
  { id: "drip-tee-navy", name: "Drip tee", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 2000, image: `/art/merch/drip-tee-navy.jpg?v=${V}`, kind: "tee", color: "Navy", swatch: "#1a1f2e" },
  { id: "drip-hoodie-black", name: "Drip hoodie", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 4500, image: `/art/merch/drip-hoodie-black.jpg?v=${V}`, kind: "hoodie", color: "Black", swatch: "#111111" },
  { id: "drip-hoodie-olive", name: "Drip hoodie", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 4500, image: `/art/merch/drip-hoodie-olive.jpg?v=${V}`, kind: "hoodie", color: "Olive", swatch: "#5c5a3a" },
  { id: "drip-hoodie-navy", name: "Drip hoodie", blurb: "FILTH FACTORY drip. Thick black outline.", pence: 4500, image: `/art/merch/drip-hoodie-navy.jpg?v=${V}`, kind: "hoodie", color: "Navy", swatch: "#1a1f2e" },
  { id: "drip-hoodie-woodland", name: "Drip hoodie", blurb: "FILTH FACTORY drip. Woodland camo.", pence: 4500, image: `/art/merch/ug-camo-drip-hoodie.jpg?v=${V}`, kind: "hoodie", color: "Woodland", swatch: "#4a5a32" },
  { id: "beanie-black", name: "Factory beanie", blurb: "Factory mark on the brim.", pence: 1800, image: `/art/merch/beanie.jpg?v=${V}`, kind: "beanie", color: "Black", swatch: "#111111" },
  { id: "snapback-black", name: "Factory cap", blurb: "Factory mark, front.", pence: 2500, image: `/art/merch/snapback-black.jpg?v=${V}`, kind: "snapback", color: "Black", swatch: "#111111" },
  { id: "mug-black", name: "Stamp mug", blurb: "Circle stamp on a black mug.", pence: 1400, image: `/art/merch/mug.jpg?v=${V}`, kind: "mug", color: "Black", swatch: "#111111" },
  { id: "keyring", name: "Stamp keyring", blurb: "Metal disc.", pence: 800, image: `/art/merch/keyring.jpg?v=${V}`, kind: "keyring", color: "Steel", swatch: "#c4c4c0" },
];

export const CAMO_MERCH: MerchSku[] = [
  { id: "camo-tee-woodland", name: "Jungle tee", blurb: "Woodland camo. Drip FILTH FACTORY.", pence: 2000, image: `/art/merch/drip-tee-woodland.jpg?v=${V}`, kind: "tee", color: "Woodland", swatch: "#4a5a32" },
];

export const SPOOF_MERCH: MerchSku[] = [
  { id: "spoof-brokelads-black", name: "Brokelads tee", blurb: "Bookies fascia.", pence: 2000, image: `/art/merch/drafts/tee-brokelads-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-crack-black", name: "Crack Converters tee", blurb: "Yellow and send blue. Cropped.", pence: 2000, image: `/art/merch/spoof-crack-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-superdrugs-white", name: "Superdrugs tee", blurb: "Chemist gag.", pence: 2000, image: `/art/merch/drafts/tee-superdrugs-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-greggs-black", name: "Greggs Afters tee", blurb: "6am meat bake.", pence: 2000, image: `/art/merch/drafts/tee-greggs-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-paddy-black", name: "Paddy Powder tee", blurb: "In-play all night.", pence: 2000, image: `/art/merch/drafts/tee-paddy-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-gurnoff-black", name: "Gurnoff tee", blurb: "No filter just teeth.", pence: 2000, image: `/art/merch/drafts/tee-gurnoff-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-silk-black", name: "Silk Cuts tee", blurb: "Purple pack gag.", pence: 2000, image: `/art/merch/drafts/tee-silk-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-stoned-black", name: "Stoned Island tee", blurb: "4am in the car park.", pence: 2000, image: `/art/merch/drafts/tee-stoned-black.jpg?v=${V}`, kind: "tee", color: "Black", swatch: "#111111" },
  { id: "spoof-weedafix-black", name: "Weedafix tee", blurb: "Breakfast of champions.", pence: 2000, image: `/art/merch/spoof-weedafix-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-dila-black", name: "Dila tee", blurb: "Navy red sports gag.", pence: 2000, image: `/art/merch/spoof-dila-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-gay-black", name: "Gay tee", blurb: "Navy square. Chest size.", pence: 2000, image: `/art/merch/spoof-gay-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-lucozed-black", name: "Lucozed tee", blurb: "Orange energy gag.", pence: 2000, image: `/art/merch/spoof-lucozed-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-faze-black", name: "North Faze tee", blurb: "Outdoor stack gag.", pence: 2000, image: `/art/merch/spoof-faze-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
  { id: "spoof-adihash-black", name: "Adihash tee", blurb: "Three bars.", pence: 2000, image: `/art/merch/spoof-adihash-white.jpg?v=${V}`, kind: "tee", color: "White", swatch: "#f4f4f0" },
];

export const DROP_SHOT = "/art/merch/drop.jpg";

export function allMerch() {
  return [...CLASH_MERCH, ...FACTORY_MERCH, ...CAMO_MERCH, ...SPOOF_MERCH];
}

export function merchById(id: string) {
  return allMerch().find((m) => m.id === id) ?? null;
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

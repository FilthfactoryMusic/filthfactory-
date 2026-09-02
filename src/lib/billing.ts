export type PlanId = "resident" | "featured";

export type Plan = {
  id: PlanId;
  name: string;
  pence: number;
  tagline: string;
  points: string[];
};

export type GiftSku = {
  sku: string;
  label: string;
  pence: number;
};

export const PLANS: Plan[] = [
  {
    id: "resident",
    name: "Resident",
    pence: 500,
    tagline: "Go live, drop mixes, gift the booth.",
    points: [
      "Unlimited listening",
      "Go live from the booth",
      "Drop mixes to your crate",
      "Gift live DJs — they keep 50%",
    ],
  },
  {
    id: "featured",
    name: "Featured",
    pence: 1500,
    tagline: "Your stream, advertised on Discover.",
    points: [
      "Everything in Resident",
      "Advertised on the main feed while you are live",
      "Featured badge on your broadcast",
      "Priority placement above the room",
    ],
  },
];

export const GIFT_SKUS: GiftSku[] = [
  { sku: "drip", label: "Drip", pence: 100 },
  { sku: "filth", label: "Filth", pence: 200 },
  { sku: "warehouse", label: "Warehouse", pence: 500 },
  { sku: "afters", label: "Afters", pence: 1000 },
  { sku: "factory", label: "Factory", pence: 2500 },
];

export const PLAN_COMPARE: {
  feature: string;
  listen: boolean;
  resident: boolean;
  featured: boolean;
}[] = [
  { feature: "Mixes and live, UK-wide", listen: true, resident: true, featured: true },
  { feature: "Go live from the booth", listen: false, resident: true, featured: true },
  { feature: "Drop mixes to your crate", listen: false, resident: true, featured: true },
  { feature: "Send live gifts", listen: false, resident: true, featured: true },
  { feature: "DJ keeps 50% of every gift", listen: false, resident: true, featured: true },
  { feature: "Advertised on Discover while live", listen: false, resident: false, featured: true },
];

export function planById(id: string | null | undefined) {
  return PLANS.find((p) => p.id === id) ?? null;
}

export function giftBySku(sku: string) {
  return GIFT_SKUS.find((g) => g.sku === sku) ?? null;
}

export const VAT_NOTE = "Prices include UK VAT.";
export const GIFT_SPLIT_NOTE = "The DJ receives 50%. Filthfactory receives 50%.";
export const DIGITAL_WAIVER_NOTE =
  "I want immediate access and I accept that I lose my 14-day cooling-off right for this digital content.";

export function splitGift(pence: number) {
  const dj = Math.floor(pence / 2);
  return { dj, platform: pence - dj };
}


import { allMerch, type MerchKind, type MerchSku } from "@/lib/merch";

export type OpsStatus = "pending" | "approved" | "hold" | "reject";

export type Supplier = {
  id: string;
  name: string;
  kind: "pod" | "batch" | "emb";
  site: string;
  blurb: string;
  uk: boolean;
};

/** Public UK print partners. Quotes are typical bands, not live contracts. */
export const SUPPLIERS: Supplier[] = [
  {
    id: "gelato",
    name: "Gelato",
    kind: "pod",
    site: "https://www.gelato.com/",
    blurb: "UK print nodes. DTG tees and hoodies. Best first link.",
    uk: true,
  },
  {
    id: "prodigi",
    name: "Prodigi",
    kind: "pod",
    site: "https://www.prodigi.com/",
    blurb: "UK. Good for small runs and mugs.",
    uk: true,
  },
  {
    id: "printful",
    name: "Printful",
    kind: "pod",
    site: "https://www.printful.com/",
    blurb: "EU/UK. Easy Shopify/Stripe later.",
    uk: true,
  },
  {
    id: "teemill",
    name: "Teemill",
    kind: "pod",
    site: "https://teemill.com/",
    blurb: "Isle of Wight. Organic blanks. Tees.",
    uk: true,
  },
  {
    id: "shirtworks",
    name: "Shirtworks",
    kind: "batch",
    site: "https://www.shirtworks.co.uk/",
    blurb: "UK screen. Better once a design sells 50+.",
    uk: true,
  },
  {
    id: "capaholic",
    name: "Local emb",
    kind: "emb",
    site: "https://www.filthfactory.co.uk/ops",
    blurb: "Beanies and caps: embroider, not print. Quote per run.",
    uk: true,
  },
];

const COST: Record<MerchKind, { low: number; high: number; partner: string; method: string }> = {
  tee: { low: 900, high: 1200, partner: "gelato", method: "DTG" },
  hoodie: { low: 2800, high: 3600, partner: "gelato", method: "DTG" },
  beanie: { low: 900, high: 1200, partner: "capaholic", method: "Embroidery" },
  snapback: { low: 1100, high: 1500, partner: "capaholic", method: "Embroidery" },
  mug: { low: 600, high: 900, partner: "prodigi", method: "Print" },
  keyring: { low: 350, high: 550, partner: "prodigi", method: "Print" },
  tote: { low: 700, high: 1000, partner: "teemill", method: "Print" },
  badge: { low: 250, high: 400, partner: "prodigi", method: "Print" },
  sticker: { low: 150, high: 300, partner: "prodigi", method: "Print" },
  lighter: { low: 400, high: 700, partner: "prodigi", method: "Print" },
};

export const QC_GATES = [
  "Print sits on the chest, not a photo square",
  "No extra words (no Elbourt, no brand files)",
  "Drip lockup has the thick black outline",
  "Hats: mark on the brim, embroider if we can",
  "Spoof is original type, close vibe, not their file",
  "White tees for colour lockups, black/olive for factory",
] as const;

export type OpsLine = {
  sku: string;
  name: string;
  color: string;
  kind: MerchKind;
  image: string;
  sell: number;
  costLow: number;
  costHigh: number;
  stripeFee: number;
  marginLow: number;
  marginHigh: number;
  partner: string;
  method: string;
  status: OpsStatus;
  note: string;
};

function stripeFee(pence: number) {
  return Math.round(pence * 0.029 + 20);
}

export function gatherOps(status: Record<string, OpsStatus> = {}): OpsLine[] {
  return allMerch().map((item: MerchSku) => {
    const band = COST[item.kind] ?? COST.tee;
    const fee = stripeFee(item.pence);
    return {
      sku: item.id,
      name: item.name,
      color: item.color,
      kind: item.kind,
      image: item.image,
      sell: item.pence,
      costLow: band.low,
      costHigh: band.high,
      stripeFee: fee,
      marginLow: item.pence - band.high - fee,
      marginHigh: item.pence - band.low - fee,
      partner: band.partner,
      method: band.method,
      status: status[item.id] ?? "pending",
      note: item.blurb,
    };
  });
}

export function opsSummary(lines: OpsLine[]) {
  const pending = lines.filter((l) => l.status === "pending").length;
  const approved = lines.filter((l) => l.status === "approved").length;
  const hold = lines.filter((l) => l.status === "hold").length;
  const thin = lines.filter((l) => l.marginLow < 300).length;
  return { pending, approved, hold, thin, total: lines.length };
}

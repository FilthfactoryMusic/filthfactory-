export type DeskId = "cos" | "mandem" | "deals" | "visual" | "social" | "booth" | "till" | "legal";

export type Desk = {
  id: DeskId;
  name: string;
  crew: string;
  job: string;
  now: string;
  href: string;
};

export const DESKS: Desk[] = [
  {
    id: "cos",
    name: "Chief of staff",
    crew: "Desk",
    job: "Eight loops. Week board. You approve.",
    now: "Run the day. Nothing ships without OK.",
    href: "/desk",
  },
  {
    id: "mandem",
    name: "Mandem",
    crew: "Scene",
    job: "WOW, rooms, real DJs. No fake names.",
    now: "Who's on. What's live. What's next.",
    href: "/mandem",
  },
  {
    id: "deals",
    name: "Deals",
    crew: "Floor",
    job: "Labels, shops, print, Beatport. Drafts only until you send.",
    now: "Nothing outbound until you tap send.",
    href: "/deals",
  },
  {
    id: "visual",
    name: "Visual",
    crew: "Art",
    job: "Lockups, merch, no squares, no Elbourt.",
    now: "QC the shop. Ops OK.",
    href: "/visual",
  },
  {
    id: "social",
    name: "Social ops",
    crew: "Rep",
    job: "Captions, Represent, Friday tease. You post.",
    now: "Copy is ready. Accounts are yours.",
    href: "/social",
  },
  {
    id: "booth",
    name: "Booth",
    crew: "On air",
    job: "Go live. Camera off = logo. End show. Share.",
    now: "If the room is dead, don't fake listeners.",
    href: "/booth",
  },
  {
    id: "till",
    name: "Till",
    crew: "Money",
    job: "£5 booth. Shop. Stripe. Gelato later.",
    now: "Keys are on you. Desk will not pretend.",
    href: "/membership",
  },
  {
    id: "legal",
    name: "Rights",
    crew: "Straight",
    job: "18+. No blanket PRS. Honest copy.",
    now: "Don't sell what we can't licence.",
    href: "/terms",
  },
];

export const DEAL_DRAFTS = [
  { who: "Gelato", what: "UK DTG. Tees and hoodies. First print partner.", status: "wait you" },
  { who: "Prodigi", what: "Mugs, small runs.", status: "wait you" },
  { who: "Hospital / V / Born on Road", what: "Logo use + shop link. Ask, don't scrape merch.", status: "draft" },
  { who: "Beatport", what: "Affiliate. WAV/MP3 out. Need your ID live.", status: "wait you" },
  { who: "Bop DJ / DJ Shop", what: "Controller aisle. Their stock, our link.", status: "draft" },
];

export const SOCIAL_PACK = [
  "The download shops packed up. The crate didn't.",
  "If it's filthy it bangs.",
  "Free to listen. Fiver to go live.",
  "Garage. Grime. Bassline. 140. DnB. Tech house.",
  "Not a playlist. A booth.",
  "Wear it. Represent. Don't wait for a publicist.",
];

/** Chief of Staff. Real loops, not fake listeners. */

export type LoopId = "identity" | "listen" | "ritual" | "scene" | "share" | "booth" | "uniform" | "till";

export type Loop = {
  id: LoopId;
  name: string;
  why: string;
  doNow: string;
  href: string;
  cta: string;
};

/** Eight loops. Identity first, money last. Proof must be real. */
export const LOOPS: Loop[] = [
  {
    id: "identity",
    name: "In-group",
    why: "People buy belonging, not features. Filthy it bangs is the password.",
    doNow: "Keep the line. No disco. No fake names.",
    href: "/",
    cta: "Home",
  },
  {
    id: "listen",
    name: "Free first",
    why: "Zero cost to sample. Reciprocity. Then they pay to broadcast.",
    doNow: "What's on now is always one tap. No login wall on listen.",
    href: "/live",
    cta: "On air",
  },
  {
    id: "ritual",
    name: "Friday crate",
    why: "Same time every week = habit. Charts lock midnight Thursday London.",
    doNow: "Don't refresh mid-week. The lock is the event.",
    href: "/charts",
    cta: "Charts",
  },
  {
    id: "scene",
    name: "WOW",
    why: "Daily who/where. Authority without a magazine.",
    doNow: "Real artists, last 90 days, links out.",
    href: "/wow",
    cta: "WOW",
  },
  {
    id: "share",
    name: "Represent",
    why: "Identity spread. They post because it says who they are.",
    doNow: "Share flyer. No fake viewer counts.",
    href: "/live",
    cta: "Share",
  },
  {
    id: "booth",
    name: "Booth",
    why: "£5 is a decision, not a tip. Status: you are on air.",
    doNow: "Go live must work. Camera off = logo. End button.",
    href: "/booth",
    cta: "Go live",
  },
  {
    id: "uniform",
    name: "Merch",
    why: "Costly signal. Walking billboard. Ops OK before print.",
    doNow: "Approve SKUs. Gelato later. No square logos.",
    href: "/ops",
    cta: "Ops",
  },
  {
    id: "till",
    name: "Till",
    why: "Stripe + print partner. No pretend checkout.",
    doNow: "Keys in Vercel. You get the ping to approve spend.",
    href: "/membership",
    cta: "£5",
  },
];

export const WEEK = [
  { day: "Mon", move: "WOW refresh. One scene post. Represent the best live." },
  { day: "Tue", move: "School or software scrap. DJs saving crate = habit." },
  { day: "Wed", move: "Merch Ops. Approve or hold. No new squares." },
  { day: "Thu", move: "Night: charts lock 00:00 London. Tease Friday crate." },
  { day: "Fri", move: "Crate live. Shop drop. Go live push." },
  { day: "Sat", move: "Booth night. Gifts later. Share flyers only if a room is real." },
  { day: "Sun", move: "Desk review. Thin margins. What actually got taps." },
];

export const BLOCKERS = [
  { id: "stripe", label: "Stripe live keys", owner: "you" },
  { id: "db", label: "Database for accounts", owner: "you" },
  { id: "gelato", label: "Print partner (Gelato)", owner: "you" },
  { id: "livekit", label: "LiveKit on production", owner: "you" },
];

export function londonDay() {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/London" }).format(new Date());
}

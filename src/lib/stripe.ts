import Stripe from "stripe";

const LIVE_ORIGIN = "https://www.filthfactory.co.uk";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_UNAVAILABLE");
  }
  return new Stripe(key);
}

export function publicOrigin(): string {
  const fromEnv = process.env.APP_URL?.replace(/\/$/, "");
  if (fromEnv?.startsWith("https://")) return fromEnv;
  return LIVE_ORIGIN;
}

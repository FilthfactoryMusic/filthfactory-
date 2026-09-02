import Stripe from "stripe";

const LIVE_ORIGIN = "https://www.filthfactory.co.uk";
const PAY_DOMAINS = ["www.filthfactory.co.uk", "filthfactory.co.uk"];

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

/** Google Pay / Apple Pay only show on Checkout once Stripe knows this domain. */
export async function ensureWalletDomains(stripe: Stripe) {
  for (const domain_name of PAY_DOMAINS) {
    try {
      await stripe.paymentMethodDomains.create({ domain_name });
    } catch {
      /* already registered, or API not on this account yet */
    }
  }
}

export async function createMembershipCheckout(
  stripe: Stripe,
  opts: {
    userId: string;
    plan: string;
    name: string;
    description: string;
    pence: number;
    origin: string;
  },
) {
  const payload = {
    mode: "subscription" as const,
    client_reference_id: opts.userId,
    metadata: { userId: opts.userId, plan: opts.plan },
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan } },
    billing_address_collection: "auto" as const,
    locale: "en-GB" as const,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: opts.pence,
          recurring: { interval: "month" as const },
          product_data: { name: opts.name, description: opts.description },
        },
      },
    ],
    success_url: `${opts.origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/membership`,
  };

  const methodSets: Stripe.Checkout.SessionCreateParams.PaymentMethodType[][] = [
    ["card", "paypal", "link"],
    ["card", "paypal"],
    ["card", "link"],
    ["card"],
  ];

  let last: unknown;
  for (const payment_method_types of methodSets) {
    try {
      return await stripe.checkout.sessions.create({ ...payload, payment_method_types });
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error("STRIPE_UNAVAILABLE");
}

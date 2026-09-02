import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { GIFT_SKUS, PLANS, splitGift, type PlanId } from "@/lib/billing";
import { LEGAL_VERSION, PAYOUT_MIN_PENCE, vatBreakdown } from "@/lib/legal";
import { hashString } from "@/lib/utils";
import { getLive } from "@/lib/catalog";

export type GiftRow = {
  id: string;
  liveId: string;
  fromName: string;
  toName: string;
  sku: string;
  label: string;
  amountPence: number;
  djSharePence: number;
  createdAt: string;
};

export type InvoiceRow = {
  id: string;
  kind: string;
  description: string;
  amountPence: number;
  vatPence: number;
  netPence: number;
  status: string;
  createdAt: string;
};

export type PayoutRow = {
  id: string;
  amountPence: number;
  status: string;
  createdAt: string;
};

export type BillingSnapshot = {
  plan: PlanId | null;
  status: string | null;
  renewsAt: string | null;
  amountPence: number;
  walletAvailable: number;
  walletLifetime: number;
  sent: GiftRow[];
  received: GiftRow[];
  invoices: InvoiceRow[];
  payouts: PayoutRow[];
};

export type CheckoutInput = {
  plan: PlanId;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  communityAccepted: boolean;
  digitalWaiver: boolean;
};

type SubRow = {
  plan: string;
  status: string;
  amount_pence: number;
  renews_at: string;
};

type WalletRow = { available_pence: number; lifetime_pence: number };

type GiftDb = {
  id: string;
  live_id: string;
  from_name: string;
  to_name: string;
  sku: string;
  label: string;
  amount_pence: number;
  dj_share_pence: number;
  created_at: string;
};

type InvoiceDb = {
  id: string;
  kind: string;
  description: string;
  amount_pence: number;
  vat_pence: number;
  net_pence: number;
  status: string;
  created_at: string;
};

type PayoutDb = {
  id: string;
  amount_pence: number;
  status: string;
  created_at: string;
};

function asGift(row: GiftDb): GiftRow {
  return {
    id: row.id,
    liveId: row.live_id,
    fromName: row.from_name,
    toName: row.to_name,
    sku: row.sku,
    label: row.label,
    amountPence: row.amount_pence,
    djSharePence: row.dj_share_pence,
    createdAt: row.created_at,
  };
}

async function activePlan(
  sql: {
    <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  },
  userId: string,
) {
  const rows = await sql<SubRow>`
    select plan, status, amount_pence, renews_at from subscriptions where user_id = ${userId}
  `;
  const row = rows[0];
  if (!row || row.status !== "active") return null;
  if (row.plan !== "resident" && row.plan !== "featured") return null;
  return row;
}

async function writeInvoice(
  sql: {
    <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  },
  opts: { userId: string; kind: string; description: string; amountPence: number },
) {
  const { vat, net } = vatBreakdown(opts.amountPence);
  const id = `inv-${hashString(opts.userId + opts.kind + Date.now()).toString(36)}`;
  await sql`
    insert into invoices (id, user_id, kind, description, amount_pence, vat_pence, net_pence, status)
    values (${id}, ${opts.userId}, ${opts.kind}, ${opts.description}, ${opts.amountPence}, ${vat}, ${net}, 'paid')
  `;
}

async function writeConsents(
  sql: {
    <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  },
  userId: string,
  kinds: string[],
) {
  for (const kind of kinds) {
    await sql`
      insert into consents (user_id, kind, version, created_at)
      values (${userId}, ${kind}, ${LEGAL_VERSION}, now())
      on conflict (user_id, kind) do update set version = excluded.version, created_at = now()
    `;
  }
}

export const getMyBilling = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<BillingSnapshot> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const sub = (
      await sql<SubRow>`
        select plan, status, amount_pence, renews_at from subscriptions where user_id = ${context.userId}
      `
    )[0];
    const wallet = (
      await sql<WalletRow>`
        select available_pence, lifetime_pence from wallets where user_id = ${context.userId}
      `
    )[0];
    const sent = await sql<GiftDb>`
      select id, live_id, from_name, to_name, sku, label, amount_pence, dj_share_pence, created_at
      from gifts where from_user_id = ${context.userId}
      order by created_at desc limit 20
    `;
    const received = await sql<GiftDb>`
      select id, live_id, from_name, to_name, sku, label, amount_pence, dj_share_pence, created_at
      from gifts where to_user_id = ${context.userId}
      order by created_at desc limit 20
    `;
    const invoices = await sql<InvoiceDb>`
      select id, kind, description, amount_pence, vat_pence, net_pence, status, created_at
      from invoices where user_id = ${context.userId}
      order by created_at desc limit 24
    `;
    const payouts = await sql<PayoutDb>`
      select id, amount_pence, status, created_at
      from payouts where user_id = ${context.userId}
      order by created_at desc limit 12
    `;
    const plan = sub && (sub.plan === "resident" || sub.plan === "featured") ? sub.plan : null;
    return {
      plan: sub?.status === "active" ? plan : null,
      status: sub?.status ?? null,
      renewsAt: sub?.renews_at ?? null,
      amountPence: sub?.amount_pence ?? 0,
      walletAvailable: wallet?.available_pence ?? 0,
      walletLifetime: wallet?.lifetime_pence ?? 0,
      sent: sent.map(asGift),
      received: received.map(asGift),
      invoices: invoices.map((r) => ({
        id: r.id,
        kind: r.kind,
        description: r.description,
        amountPence: r.amount_pence,
        vatPence: r.vat_pence,
        netPence: r.net_pence,
        status: r.status,
        createdAt: r.created_at,
      })),
      payouts: payouts.map((r) => ({
        id: r.id,
        amountPence: r.amount_pence,
        status: r.status,
        createdAt: r.created_at,
      })),
    };
  });

export const startMembership = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: CheckoutInput) => d)
  .handler(async ({ context, data }) => {
    const spec = PLANS.find((p) => p.id === data.plan);
    if (!spec) throw new Error("Unknown plan");
    if (!data.ageConfirmed || !data.termsAccepted || !data.communityAccepted || !data.digitalWaiver) {
      throw new Error("CONSENT_REQUIRED");
    }
    const { getStripe, publicOrigin } = await import("@/lib/stripe");
    const stripe = getStripe();
    const origin = publicOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: context.userId,
      metadata: {
        userId: context.userId,
        plan: spec.id,
      },
      subscription_data: {
        metadata: {
          userId: context.userId,
          plan: spec.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: spec.pence,
            recurring: { interval: "month" },
            product_data: {
              name: `Filthfactory ${spec.name}`,
              description:
                spec.id === "featured"
                  ? "Featured membership — booth, mixes, gifts and Discover placement while live."
                  : "Resident membership — booth, mixes and live gifts. Listening stays free.",
            },
          },
        },
      ],
      success_url: `${origin}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membership`,
    });
    if (!session.url) throw new Error("STRIPE_UNAVAILABLE");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await writeConsents(sql, context.userId, ["age", "terms", "community", "digital_waiver"]);
    return { url: session.url };
  });

export const fulfillMembership = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { sessionId: string }) => d)
  .handler(async ({ context, data }) => {
    if (!data.sessionId.startsWith("cs_")) throw new Error("BAD_SESSION");
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const paid = session.status === "complete" && session.payment_status === "paid";
    if (!paid) throw new Error("UNPAID");
    const userId = session.metadata?.userId || session.client_reference_id;
    if (!userId || userId !== context.userId) throw new Error("SESSION_MISMATCH");
    const planRaw = session.metadata?.plan;
    const spec = PLANS.find((p) => p.id === planRaw) ?? PLANS[0];
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into subscriptions (user_id, plan, status, amount_pence, started_at, renews_at, cancelled_at)
      values (
        ${context.userId}, ${spec.id}, 'active', ${spec.pence}, now(), now() + interval '1 month', null
      )
      on conflict (user_id) do update set
        plan = excluded.plan,
        status = 'active',
        amount_pence = excluded.amount_pence,
        renews_at = now() + interval '1 month',
        cancelled_at = null
    `;
    await sql`
      insert into wallets (user_id, available_pence, lifetime_pence)
      values (${context.userId}, 0, 0)
      on conflict (user_id) do nothing
    `;
    await sql`
      update booth_lives set featured = ${spec.id === "featured"} where user_id = ${context.userId}
    `;
    await writeInvoice(sql, {
      userId: context.userId,
      kind: "membership",
      description: `${spec.name} membership — one calendar month`,
      amountPence: spec.pence,
    });
    return { plan: spec.id, amountPence: spec.pence };
  });

export const cancelMembership = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update subscriptions
      set status = 'cancelled', cancelled_at = now()
      where user_id = ${context.userId}
    `;
    await sql`update booth_lives set featured = false where user_id = ${context.userId}`;
  });

export const requestPayout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const wallet = (
      await sql<WalletRow>`
        select available_pence, lifetime_pence from wallets where user_id = ${context.userId}
      `
    )[0];
    const available = wallet?.available_pence ?? 0;
    if (available < PAYOUT_MIN_PENCE) throw new Error("PAYOUT_MINIMUM");
    const id = `po-${hashString(context.userId + Date.now()).toString(36)}`;
    await sql`
      insert into payouts (id, user_id, amount_pence, status)
      values (${id}, ${context.userId}, ${available}, 'pending')
    `;
    await sql`
      update wallets set available_pence = 0 where user_id = ${context.userId}
    `;
    return { id, amountPence: available };
  });

export const listLiveGifts = createServerFn({ method: "POST" })
  .validator((liveId: string) => liveId)
  .handler(async ({ data: liveId }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<GiftDb>`
      select id, live_id, from_name, to_name, sku, label, amount_pence, dj_share_pence, created_at
      from gifts where live_id = ${liveId}
      order by created_at desc
      limit 40
    `;
    return rows.map(asGift);
  });

export const sendLiveGift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { liveId: string; sku: string; fromName: string }) => d)
  .handler(async ({ context, data }) => {
    const sku = GIFT_SKUS.find((g) => g.sku === data.sku);
    if (!sku) throw new Error("Unknown gift");
    const { GIFTS_ON_SALE } = await import("@/lib/legal");
    if (!GIFTS_ON_SALE) throw new Error("GIFTS_NOT_ON_SALE");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const sub = await activePlan(sql, context.userId);
    if (!sub) throw new Error("MEMBERSHIP_REQUIRED");

    const liveRows = await sql<{ user_id: string; display_name: string }>`
      select user_id, display_name from booth_lives where id = ${data.liveId}
    `;
    let toUserId: string | null = liveRows[0]?.user_id ?? null;
    let toName = liveRows[0]?.display_name ?? "Resident";
    if (!liveRows[0]) {
      const catalog = getLive(data.liveId);
      if (!catalog) throw new Error("Broadcast not found");
      toName = catalog.hostName ?? catalog.title;
      toUserId = null;
    }
    if (toUserId && toUserId === context.userId) throw new Error("You cannot gift your own broadcast");

    const { dj, platform } = splitGift(sku.pence);
    const id = `g-${hashString(context.userId + data.liveId + Date.now()).toString(36)}`;
    const fromName = data.fromName.trim() || "Member";
    await sql`
      insert into gifts (
        id, live_id, from_user_id, from_name, to_user_id, to_name, sku, label,
        amount_pence, dj_share_pence, platform_share_pence
      ) values (
        ${id}, ${data.liveId}, ${context.userId}, ${fromName}, ${toUserId}, ${toName},
        ${sku.sku}, ${sku.label}, ${sku.pence}, ${dj}, ${platform}
      )
    `;
    if (toUserId) {
      await sql`
        insert into wallets (user_id, available_pence, lifetime_pence)
        values (${toUserId}, ${dj}, ${dj})
        on conflict (user_id) do update set
          available_pence = wallets.available_pence + ${dj},
          lifetime_pence = wallets.lifetime_pence + ${dj}
      `;
    }
    await writeInvoice(sql, {
      userId: context.userId,
      kind: "gift",
      description: `${sku.label} gift to ${toName}`,
      amountPence: sku.pence,
    });
    return {
      id,
      liveId: data.liveId,
      fromName,
      toName,
      sku: sku.sku,
      label: sku.label,
      amountPence: sku.pence,
      djSharePence: dj,
      createdAt: new Date().toISOString(),
    } satisfies GiftRow;
  });

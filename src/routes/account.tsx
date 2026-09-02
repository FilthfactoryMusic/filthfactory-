import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cancelMembership, requestPayout } from "@/lib/billing-api";
import { useMyBilling } from "@/lib/use-billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { formatGbp } from "@/lib/utils";
import { planById } from "@/lib/billing";
import { PAYOUT_MIN_PENCE } from "@/lib/legal";
import { listMyBlocks, unblockUser } from "@/lib/moderation-api";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const user = useCurrentUser();
  const billing = useMyBilling();
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    void listMyBlocks()
      .then(setBlocks)
      .catch(() => setBlocks([]));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-8 text-center">
        <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Account</h1>
        <p className="mt-3 text-sm text-muted">Sign in to manage membership, receipts and gift earnings.</p>
        <Button className="mt-6" asChild>
          <Link to="/login" search={{ redirect: "/account" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  const plan = planById(billing.plan);

  async function cancel() {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await cancelMembership();
      setConfirmCancel(false);
      billing.refresh();
    } catch {
      setError("Could not cancel. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function payout() {
    setBusy(true);
    setPayoutMsg(null);
    setError(null);
    try {
      const row = await requestPayout();
      setPayoutMsg(`Payout requested for ${formatGbp(row.amountPence)}. We'll email you to complete bank details.`);
      billing.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("PAYOUT_MINIMUM") ? `Minimum payout is ${formatGbp(PAYOUT_MIN_PENCE)}.` : "Payout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unblock(id: string) {
    try {
      await unblockUser({ data: id });
      setBlocks((b) => b.filter((x) => x !== id));
    } catch {
      setError("Could not unblock.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Account</h1>
      <p className="mt-1 text-sm text-muted">{user.displayName ?? user.primaryEmail}</p>

      <section className="mt-8 rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Membership</h2>
          {plan ? (
            <span className="text-xs uppercase tracking-widest text-muted">Active</span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted">None</span>
          )}
        </div>
        {plan ? (
          <>
            <p className="mt-3 font-display text-3xl tabular-nums">{formatGbp(plan.pence)}</p>
            <p className="mt-1 text-sm">{plan.name} · per calendar month</p>
            {billing.renewsAt ? (
              <p className="mt-1 text-sm text-muted">
                Renews{" "}
                {new Date(billing.renewsAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted">
              {billing.plan === "featured"
                ? "Your live stream is advertised on Discover while you are on air."
                : "Upgrade to Featured to advertise your live on the main feed."}
            </p>
            {error ? <p className="mt-2 text-sm text-live">{error}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {billing.plan !== "featured" ? (
                <Button asChild>
                  <Link to="/membership">Upgrade to Featured</Link>
                </Button>
              ) : null}
              <Button variant={confirmCancel ? "live" : "outline"} disabled={busy} onClick={() => void cancel()}>
                {confirmCancel ? "Confirm cancel" : "Cancel membership"}
              </Button>
              {confirmCancel ? (
                <Button variant="ghost" disabled={busy} onClick={() => setConfirmCancel(false)}>
                  Keep membership
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-faint">
              Cancel ends booth access now. The current month is not refunded once started, except where UK law
              requires.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted">
              No active membership. Resident is {formatGbp(500)} a month to go live, drop mixes and gift DJs.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/membership">Join from {formatGbp(500)} / month</Link>
            </Button>
          </>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Live gifts</h2>
        <p className="mt-2 text-sm text-muted">
          You keep 50% of gifts sent to your broadcasts. Filthfactory keeps 50%. Gift income is yours to declare
          to HMRC. DJs are not employees.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Available</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{formatGbp(billing.walletAvailable)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Lifetime</p>
            <p className="mt-1 font-display text-3xl tabular-nums">{formatGbp(billing.walletLifetime)}</p>
          </div>
        </div>
        {payoutMsg ? <p className="mt-3 text-sm">{payoutMsg}</p> : null}
        <Button
          className="mt-4"
          variant="outline"
          disabled={busy || billing.walletAvailable < PAYOUT_MIN_PENCE}
          onClick={() => void payout()}
        >
          Request payout · min {formatGbp(PAYOUT_MIN_PENCE)}
        </Button>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Receipts</h2>
        {billing.invoices.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {billing.invoices.map((inv) => (
              <li key={inv.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{inv.description}</span>
                  <span className="text-xs text-muted">
                    {new Date(inv.createdAt).toLocaleDateString("en-GB")}
                    {inv.vatPence > 0 ? ` · VAT ${formatGbp(inv.vatPence)}` : ""}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatGbp(inv.amountPence)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No receipts yet. Membership lands here.</p>
        )}
      </section>

      {billing.payouts.length ? (
        <section className="mt-6">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Payouts</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {billing.payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="capitalize text-muted">{p.status}</span>
                <span className="tabular-nums">{formatGbp(p.amountPence)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Received</h2>
        {billing.received.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {billing.received.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0 truncate">
                  {g.fromName} sent {g.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted">+{formatGbp(g.djSharePence)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No gifts received yet. 50% of gifts to your live land here.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Sent</h2>
        {billing.sent.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {billing.sent.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0 truncate">
                  {g.label} to {g.toName}
                </span>
                <span className="shrink-0 tabular-nums text-muted">{formatGbp(g.amountPence)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">You have not sent a gift yet.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Blocked</h2>
        {blocks.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {blocks.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="truncate text-muted">{id}</span>
                <button type="button" className="h-11 text-sm underline underline-offset-4" onClick={() => void unblock(id)}>
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No blocked accounts.</p>
        )}
      </section>
    </div>
  );
}

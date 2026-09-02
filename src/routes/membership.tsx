import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { DIGITAL_WAIVER_NOTE, GIFT_SKUS, PLAN_COMPARE, PLANS, splitGift, VAT_NOTE, type PlanId } from "@/lib/billing";
import { startMembership } from "@/lib/billing-api";
import { useMyBilling } from "@/lib/use-billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { formatGbp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MIN_AGE, vatBreakdown } from "@/lib/legal";

export const Route = createFileRoute("/membership")({ component: MembershipPage });

const FAQ = [
  {
    q: "Is listening free?",
    a: "Yes. Mixes, live rooms and charts stay open. Membership is for the booth, mix drops and sending gifts.",
  },
  {
    q: "What is Featured?",
    a: "Featured is £15 a calendar month, VAT included. While you are live, your stream is advertised on Discover, above the rest of the room.",
  },
  {
    q: "How do live gifts work?",
    a: "Members send Drip, Filth, Warehouse, Afters or Factory during a broadcast. Gifts are digital goods. The DJ receives 50% as a talent share. Filthfactory receives 50%. Gifts are not refundable once sent.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, any time from Account. Cancel ends membership immediately, including Featured placement. The current month is not refunded once it has started, except where UK law requires.",
  },
  {
    q: "Do you licence all records?",
    a: "No. Filthfactory does not hold a blanket PRS or PPL licence. You may only broadcast or drop mixes you have the rights to.",
  },
];

function MembershipPage() {
  const user = useCurrentUser();
  const billing = useMyBilling();
  const navigate = useNavigate();
  const [pick, setPick] = useState<PlanId>("resident");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [community, setCommunity] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const chosen = PLANS.find((p) => p.id === pick) ?? PLANS[0];
  const vat = vatBreakdown(chosen.pence);
  const ready = age && terms && community && waiver;

  async function confirm() {
    if (!user) {
      void navigate({ to: "/login", search: { redirect: "/membership" } });
      return;
    }
    if (!ready) {
      setError("Tick every box to pay.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await startMembership({
        data: {
          plan: pick,
          ageConfirmed: age,
          termsAccepted: terms,
          communityAccepted: community,
          digitalWaiver: waiver,
        },
      });
      billing.refresh();
      void navigate({ to: "/account" });
    } catch {
      setError("Payment did not go through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const cta = !user
    ? "Sign in to pay"
    : busy
      ? "Taking payment…"
      : `Pay ${formatGbp(chosen.pence)}`;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-muted">Filthfactory · 18+</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide md:text-5xl">
        Membership
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Resident is {formatGbp(500)} a calendar month. Featured is {formatGbp(1500)} and advertises your live
        on Discover. Listening stays free. DJs keep 50% of every gift. {VAT_NOTE}
      </p>

      {billing.plan ? (
        <p className="mt-4 text-sm">
          You are on <span className="font-medium">{billing.plan === "featured" ? "Featured" : "Resident"}</span>.{" "}
          <Link to="/account" className="underline underline-offset-4">
            Manage account
          </Link>
        </p>
      ) : null}

      <div className="mt-8 hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="px-3 py-3 font-medium sm:px-4">Included</th>
              <th className="px-2 py-3 text-center font-medium">Listen</th>
              <th className="px-2 py-3 text-center font-medium">Resident</th>
              <th className="px-2 py-3 text-center font-medium">Featured</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARE.map((row) => (
              <tr key={row.feature} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-muted sm:px-4">{row.feature}</td>
                <Cell on={row.listen} />
                <Cell on={row.resident} />
                <Cell on={row.featured} />
              </tr>
            ))}
            <tr className="bg-surface">
              <td className="px-3 py-3 font-medium sm:px-4">Per calendar month, VAT included</td>
              <td className="px-2 py-3 text-center tabular-nums">Free</td>
              <td className="px-2 py-3 text-center tabular-nums">{formatGbp(500)}</td>
              <td className="px-2 py-3 text-center tabular-nums">{formatGbp(1500)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={pick === p.id}
            onClick={() => setPick(p.id)}
            className={cn(
              "rounded-lg border p-5 text-left transition-colors duration-150",
              pick === p.id ? "border-accent bg-surface" : "border-border bg-bg hover:border-accent",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-2xl font-semibold uppercase tracking-wide">{p.name}</p>
              {p.id === "featured" ? (
                <span className="text-xs uppercase tracking-widest text-muted">Advertised</span>
              ) : null}
            </div>
            <p className="mt-1 font-display text-3xl tabular-nums">{formatGbp(p.pence)}</p>
            <p className="text-sm text-muted">per calendar month, VAT included</p>
            <p className="mt-3 text-sm text-muted">{p.tagline}</p>
            <ul className="mt-4 space-y-2">
              {p.points.map((line) => (
                <li key={line} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {line}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Pay</h2>
        <p className="mt-2 text-sm text-muted">
          {chosen.name} · {formatGbp(chosen.pence)} now, then each calendar month until you cancel. Of which{" "}
          {formatGbp(vat.net)} net + {formatGbp(vat.vat)} VAT.
        </p>
        <p className="mt-2 text-sm text-muted">
          If you later install from Google Play, in-app digital purchases there use Google Play Billing.
        </p>
        <fieldset className="mt-4 space-y-3">
          <CheckRow checked={age} onChange={setAge}>
            I am {MIN_AGE} or over.
          </CheckRow>
          <CheckRow checked={terms} onChange={setTerms}>
            I agree to the{" "}
            <a href="/terms" className="underline underline-offset-2">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2">
              Privacy policy
            </a>
            .
          </CheckRow>
          <CheckRow checked={community} onChange={setCommunity}>
            I will follow the{" "}
            <a href="/community" className="underline underline-offset-2">
              Community rules
            </a>
            . I only broadcast content I have the rights to.
          </CheckRow>
          <CheckRow checked={waiver} onChange={setWaiver}>
            {DIGITAL_WAIVER_NOTE}
          </CheckRow>
        </fieldset>
        {error ? <p className="mt-2 text-sm text-live">{error}</p> : null}
        <Button className="mt-5 w-full sm:w-auto" disabled={busy} onClick={() => void confirm()}>
          {cta}
        </Button>
        <p className="mt-3 text-xs text-faint">
          Receipt lands in Account. Cancel any time. Live gifts split 50 / 50 with the house.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Live gifts</h2>
        <p className="mt-2 text-sm text-muted">
          Members send these in a live room. Digital, consumed on send. The DJ receives 50%. Filthfactory
          receives 50%.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {GIFT_SKUS.map((g) => {
            const { dj } = splitGift(g.pence);
            return (
              <div key={g.sku} className="rounded-md border border-border bg-surface px-3 py-3">
                <p className="text-sm font-medium">{g.label}</p>
                <p className="mt-1 text-sm tabular-nums">{formatGbp(g.pence)}</p>
                <p className="mt-1 text-xs text-muted tabular-nums">DJ {formatGbp(dj)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Questions</h2>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            <div key={item.q} className="py-4">
              <dt className="text-sm font-medium">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex gap-3 text-sm leading-relaxed text-muted">
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-accent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

function Cell({ on }: { on: boolean }) {
  return (
    <td className="px-2 py-3">
      <span
        className="mx-auto flex size-5 items-center justify-center"
        aria-label={on ? "Included" : "Not included"}
      >
        {on ? <Check className="size-4 text-accent" /> : <Minus className="size-4 text-faint" />}
      </span>
    </td>
  );
}

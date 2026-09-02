import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fulfillMembership } from "@/lib/billing-api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatGbp } from "@/lib/utils";

type Search = { session_id?: string };

export const Route = createFileRoute("/membership/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  component: MembershipSuccess,
});

function MembershipSuccess() {
  const { user, isPending } = useCurrentUserState();
  const { session_id: sessionId } = Route.useSearch();
  const [state, setState] = useState<"wait" | "ok" | "fail">("wait");
  const [plan, setPlan] = useState<string>("Resident");
  const [amount, setAmount] = useState(500);

  useEffect(() => {
    if (isPending) return;
    if (!user || !sessionId) {
      setState("fail");
      return;
    }
    let gone = false;
    void fulfillMembership({ data: { sessionId } })
      .then((row) => {
        if (gone) return;
        setPlan(row.plan === "featured" ? "Featured" : "Resident");
        setAmount(row.amountPence);
        setState("ok");
      })
      .catch(() => {
        if (!gone) setState("fail");
      });
    return () => {
      gone = true;
    };
  }, [user, sessionId, isPending]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">Filthfactory · 18+</p>
      {state === "wait" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">Taking you in</h1>
          <p className="mt-3 text-sm text-muted">Confirming the card with Stripe…</p>
        </>
      ) : null}
      {state === "ok" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">You’re in</h1>
          <p className="mt-3 text-sm text-muted">
            {plan} is live — {formatGbp(amount)} this month. Go to the booth when you’re ready.
          </p>
          <Link
            to="/booth"
            className="mt-8 inline-flex h-12 items-center rounded-sm bg-accent px-6 text-sm font-semibold text-black"
          >
            Open the booth
          </Link>
        </>
      ) : null}
      {state === "fail" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">Not confirmed</h1>
          <p className="mt-3 text-sm text-muted">
            Stripe didn’t hand back a paid membership. Sign in and try again, or check the card.
          </p>
          <Link to="/membership" className="mt-8 inline-flex text-sm underline underline-offset-4">
            Back to membership
          </Link>
        </>
      ) : null}
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fulfillMembership, recoverMembership } from "@/lib/billing-api";
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
  const navigate = useNavigate();
  const [state, setState] = useState<"wait" | "ok" | "signin" | "fail">("wait");
  const [plan, setPlan] = useState<string>("Resident");
  const [amount, setAmount] = useState(500);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setState("signin");
      const back = sessionId
        ? `/membership/success?session_id=${encodeURIComponent(sessionId)}`
        : "/membership/success";
      void navigate({ to: "/login", search: { redirect: back } });
      return;
    }
    let gone = false;
    const run = sessionId
      ? fulfillMembership({ data: { sessionId } })
      : recoverMembership();
    void run
      .then((row) => {
        if (gone) return;
        setPlan(row.plan === "featured" ? "Featured" : "Resident");
        setAmount(row.amountPence);
        setState("ok");
      })
      .catch(() => {
        if (gone) return;
        void recoverMembership()
          .then((row) => {
            if (gone) return;
            setPlan(row.plan === "featured" ? "Featured" : "Resident");
            setAmount(row.amountPence);
            setState("ok");
          })
          .catch(() => {
            if (!gone) setState("fail");
          });
      });
    return () => {
      gone = true;
    };
  }, [user, sessionId, isPending, navigate]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-xs uppercase tracking-widest text-muted">Filthfactory · 18+</p>
      {state === "wait" || state === "signin" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">Taking you in</h1>
          <p className="mt-3 text-sm text-muted">
            {state === "signin" ? "Sign in to unlock the booth — Stripe already has the payment." : "Confirming the card with Stripe…"}
          </p>
        </>
      ) : null}
      {state === "ok" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">You’re in</h1>
          <p className="mt-3 text-sm text-muted">
            {plan} is live — {formatGbp(amount)} this month.
          </p>
          <Link
            to="/booth"
            className="mt-8 inline-flex h-16 w-full max-w-sm items-center justify-center rounded-sm bg-live px-8 font-display text-2xl font-semibold uppercase tracking-[0.2em] text-live-fg"
          >
            Go live
          </Link>
        </>
      ) : null}
      {state === "fail" ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide">Almost</h1>
          <p className="mt-3 text-sm text-muted">
            Sign in with the same email you paid with. The booth will pick up the £5.
          </p>
          <Link
            to="/login"
            search={{ redirect: "/booth" }}
            className="mt-8 inline-flex h-12 items-center rounded-sm bg-live px-6 text-sm font-semibold text-live-fg"
          >
            Sign in, then go live
          </Link>
        </>
      ) : null}
    </div>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cancelMembership } from "@/lib/billing-api";
import { useMyBilling } from "@/lib/use-billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function UnsubscribeButton({ className }: { className?: string }) {
  const user = useCurrentUser();
  const billing = useMyBilling();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Button className={className} asChild>
        <Link to="/login" search={{ redirect: "/unsubscribe" }}>
          Sign in to unsubscribe
        </Link>
      </Button>
    );
  }

  if (done || !billing.plan) {
    return <p className="text-sm text-muted">No active membership. You will not be charged again.</p>;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={confirm ? "live" : "outline"}
          disabled={busy}
          onClick={() => {
            if (!confirm) {
              setConfirm(true);
              return;
            }
            setBusy(true);
            setError(null);
            void cancelMembership()
              .then(() => {
                setDone(true);
                billing.refresh();
              })
              .catch(() => setError("Could not unsubscribe. Try again."))
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Unsubscribing…" : confirm ? "Yes, unsubscribe" : "Unsubscribe"}
        </Button>
        {confirm ? (
          <Button variant="ghost" disabled={busy} onClick={() => setConfirm(false)}>
            Keep membership
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-live">{error}</p> : null}
      <p className="mt-2 text-xs text-faint">
        Stops the next charge and ends booth access now. This month is not refunded once started, except where
        UK law requires.
      </p>
    </div>
  );
}

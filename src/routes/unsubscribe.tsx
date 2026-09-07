import { createFileRoute, Link } from "@tanstack/react-router";
import { UnsubscribeButton } from "@/components/unsubscribe-button";
import { useMyBilling } from "@/lib/use-billing";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatGbp } from "@/lib/utils";
import { planById } from "@/lib/billing";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — Filthfactory" },
      { name: "description", content: "Cancel Filthfactory membership in one tap." },
    ],
  }),
});

function UnsubscribePage() {
  const user = useCurrentUser();
  const billing = useMyBilling();
  const plan = planById(billing.plan);

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Unsubscribe</h1>
      <p className="mt-3 text-sm text-muted">
        One tap. Listening stays free. Booth, mix drops and Featured advertising stop when you unsubscribe.
      </p>
      {user && plan ? (
        <p className="mt-4 text-sm">
          You are on {plan.name} · {formatGbp(plan.pence)} a month
          {billing.renewsAt
            ? ` · next charge ${new Date(billing.renewsAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}`
            : ""}
          .
        </p>
      ) : null}
      <div className="mt-6">
        <UnsubscribeButton />
      </div>
      <p className="mt-8 text-sm text-muted">
        <Link to="/account" className="underline underline-offset-4">
          Back to account
        </Link>
      </p>
    </div>
  );
}

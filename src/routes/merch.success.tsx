import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/merch/success")({ component: MerchSuccess });

function MerchSuccess() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Merch</p>
      <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide">Sorted</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Stripe has the order. Printed to order, posted in the UK. You’ll get the receipt from Stripe.
      </p>
      <Link to="/merch" className="mt-8 inline-block text-sm underline underline-offset-2">
        Back to merch
      </Link>
    </main>
  );
}

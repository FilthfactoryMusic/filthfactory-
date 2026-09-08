import { createFileRoute, Link } from "@tanstack/react-router";
import { DEAL_DRAFTS } from "@/lib/team";
import { SUPPLIERS } from "@/lib/merch-ops";

export const Route = createFileRoute("/deals")({ component: DealsPage });

function DealsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Deals desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Floor</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Drafts only. Nobody gets an email until you send it. We don't scrape label shops.
      </p>
      <div className="mt-8 grid gap-3">
        {DEAL_DRAFTS.map((d) => (
          <article key={d.who} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">{d.who}</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{d.status}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{d.what}</p>
          </article>
        ))}
      </div>
      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Print</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {SUPPLIERS.map((s) => (
          <a key={s.id} href={s.site} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-surface p-4">
            <p className="font-display font-semibold uppercase tracking-wide">{s.name}</p>
            <p className="mt-1 text-sm text-muted">{s.blurb}</p>
          </a>
        ))}
      </div>
      <Link to="/team" className="mt-8 inline-block text-xs uppercase tracking-wide underline underline-offset-2">
        Firm
      </Link>
    </main>
  );
}

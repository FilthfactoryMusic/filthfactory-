import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BLOCKERS, LOOPS, WEEK, londonDay } from "@/lib/cos";
import { loadOps } from "@/lib/merch-ops-api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  const today = londonDay();
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    void loadOps()
      .then((d) => setPending(d.summary.pending))
      .catch(() => setPending(null));
  }, []);

  const todayMove = WEEK.find((w) => today.startsWith(w.day)) ?? WEEK[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Chief of staff</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Desk</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Eight loops. Real proof only. Bots gather. You approve. No fake rooms. No fake names.
      </p>

      <section className="mt-8 rounded-lg border border-accent bg-surface p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Today · {today}</p>
        <p className="mt-2 font-display text-xl font-semibold uppercase tracking-wide">{todayMove.move}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/team">
            <Button size="sm" variant="outline">
              Firm
            </Button>
          </Link>
          <Link to="/ops">
            <Button size="sm">Merch Ops{pending != null ? ` · ${pending} waiting` : ""}</Button>
          </Link>
          <Link to="/booth">
            <Button size="sm" variant="live">
              Go live
            </Button>
          </Link>
          <Link to="/charts">
            <Button size="sm" variant="outline">
              Friday crate
            </Button>
          </Link>
        </div>
      </section>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Loops</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">Psychology in street English. Do the loop. Don't fake the metric.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOOPS.map((loop) => (
          <article key={loop.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">{loop.id}</p>
            <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide">{loop.name}</h3>
            <p className="mt-2 text-sm text-muted">{loop.why}</p>
            <p className="mt-2 text-sm">{loop.doNow}</p>
            <a href={loop.href} className="mt-3 inline-block font-display text-xs font-semibold uppercase tracking-wide underline underline-offset-2">
              {loop.cta}
            </a>
          </article>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Week</h2>
      <ol className="mt-4 space-y-2">
        {WEEK.map((w) => (
          <li
            key={w.day}
            className={`rounded-sm border px-4 py-3 text-sm ${w.day === todayMove.day ? "border-accent bg-surface" : "border-border"}`}
          >
            <span className="font-display font-semibold uppercase tracking-wide">{w.day}</span>
            <span className="text-muted"> — {w.move}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 font-display text-2xl font-semibold uppercase tracking-wide">Your keys</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">Desk can't smash the industry without these. Bots will not pretend they are done.</p>
      <ul className="mt-4 space-y-2 text-sm">
        {BLOCKERS.map((b) => (
          <li key={b.id} className="rounded-sm border border-border px-4 py-3">
            <span className="font-display font-semibold uppercase tracking-wide">{b.label}</span>
            <span className="text-muted"> · {b.owner}</span>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-faint">No fake virality. No bought listeners. The push is the loop, every week.</p>
    </main>
  );
}

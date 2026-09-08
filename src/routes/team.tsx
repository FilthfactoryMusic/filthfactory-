import { createFileRoute } from "@tanstack/react-router";
import { DESKS } from "@/lib/team";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [{ title: "Team — Filthfactory" }, { name: "description", content: "The firm. Always on. You tap OK." }],
  }),
});

function TeamPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Filthfactory</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">The firm</h1>
      <p className="mt-3 max-w-2xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        Mandem. Deals. Visual. Social. Booth. Till. Always on. You sleep. You still tap OK.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DESKS.map((d) => (
          <a key={d.id} href={d.href} className="rounded-lg border border-border bg-surface p-5 hover:border-accent">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">{d.crew}</p>
            <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-wide">{d.name}</h2>
            <p className="mt-2 text-sm">{d.job}</p>
            <p className="mt-2 text-sm text-muted">{d.now}</p>
          </a>
        ))}
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useWow } from "@/lib/use-wow";
import { mergeLiveNow, useCommunityLive } from "@/lib/use-community-live";

export const Route = createFileRoute("/mandem")({ component: MandemPage });

function MandemPage() {
  const wow = useWow();
  const live = mergeLiveNow(useCommunityLive());
  const items = wow.digest?.items.slice(0, 8) ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Mandem</p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide">Scene</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Real rooms. Real names. If it isn't live, it isn't a listener count.</p>
      <p className="mt-6 font-display text-sm font-semibold uppercase tracking-wide">
        Rooms now · {live.length}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/live" className="rounded-sm bg-live px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-live-fg">
          On air
        </Link>
        <Link to="/wow" className="rounded-sm border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide">
          WOW
        </Link>
        <Link to="/team" className="rounded-sm border border-border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide">
          Firm
        </Link>
      </div>
      <ul className="mt-8 space-y-3">
        {items.map((row) => (
          <li key={row.id} className="rounded-sm border border-border px-4 py-3">
            <p className="font-display font-semibold uppercase tracking-wide">{row.title || row.name}</p>
            {row.blurb ? <p className="mt-1 text-sm text-muted">{row.blurb}</p> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}

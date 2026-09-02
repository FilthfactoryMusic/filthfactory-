import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChartCard } from "@/components/chart-card";
import { MixGrid } from "@/components/section";
import { Input } from "@/components/ui/input";
import { LiveDot } from "@/components/live-dot";
import { searchCatalog } from "@/lib/catalog";
import { rememberCharts } from "@/lib/chart-cache";
import { searchCatalogue } from "@/lib/catalogue-api";
import { WOW_ARTISTS, WOW_LABELS } from "@/lib/wow-scan";

type Search = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({ q: String(s.q ?? "") }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps }) => {
    const q = deps.q.trim();
    if (q.length < 2) return [] as Awaited<ReturnType<typeof searchCatalogue>>;
    return searchCatalogue({ data: { q } });
  },
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tracks = Route.useLoaderData();
  const { djs, live } = searchCatalog(q);
  const names = [...WOW_ARTISTS, ...WOW_LABELS].filter((a) =>
    a.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  useEffect(() => {
    rememberCharts(tracks);
  }, [tracks]);

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">Search</h1>
      <form
        className="mt-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          const next = String(new FormData(e.currentTarget).get("q") ?? "");
          void navigate({ search: { q: next } });
        }}
      >
        <Input name="q" defaultValue={q} placeholder="Track, artist, label, genre" />
      </form>

      {!q ? (
        <p className="mt-8 text-sm text-muted">Try “garage”, “grime”, “Hospital”, or “Rinse”.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {tracks.length + djs.length + live.length + names.length} hits for “{q}”
          </p>

          {names.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">On the desk</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {names.map((n) => (
                  <li key={n.name}>
                    <Link to="/wow" className="hover:underline">
                      {n.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {djs.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Stations</h2>
              <div className="mt-4 flex flex-wrap gap-6">
                {djs.map((d) => (
                  <Link key={d.id} to="/dj/$id" params={{ id: d.id }} className="flex items-center gap-3">
                    <img src={d.photo} alt="" className="size-14 rounded-full object-cover" />
                    <span>
                      <span className="block text-sm font-medium">{d.name}</span>
                      <span className="text-xs text-muted">{d.show}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {live.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">On air</h2>
              <ul className="mt-3 space-y-2">
                {live.map((s) => (
                  <li key={s.id}>
                    <Link to="/live/$id" params={{ id: s.id }} className="flex items-center gap-2 text-sm hover:underline">
                      {s.status === "live" ? <LiveDot /> : null}
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tracks.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Releases</h2>
              <p className="mt-1 text-sm text-muted">30s preview · buy WAV/MP3 on Beatport</p>
              <div className="mt-4">
                <MixGrid>
                  {tracks.map((m) => (
                    <ChartCard key={m.id} mix={m} queue={tracks.map((x) => x.id)} />
                  ))}
                </MixGrid>
              </div>
            </section>
          ) : null}

          {!tracks.length && !djs.length && !live.length && !names.length ? (
            <p className="mt-8 text-sm text-muted">Nothing matching that. Try a genre or an artist.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

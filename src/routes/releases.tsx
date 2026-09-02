import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChartCard } from "@/components/chart-card";
import { MixGrid, Section } from "@/components/section";
import { rememberCharts } from "@/lib/chart-cache";
import { GENRE_CRATES, loadNewReleases } from "@/lib/catalogue-api";

export const Route = createFileRoute("/releases")({
  loader: () => loadNewReleases(),
  component: ReleasesPage,
  head: () => ({
    meta: [
      { title: "NEW RELEASES — Filthfactory" },
      {
        name: "description",
        content: "New UK garage, drum & bass, jungle, grime, bassline, techno. 30s previews. Buy WAV/MP3 on Beatport.",
      },
    ],
  }),
});

function ReleasesPage() {
  const packs = Route.useLoaderData();
  useEffect(() => {
    rememberCharts(packs.flatMap((p) => p.mixes));
  }, [packs]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-accent">UK crate · 30s preview</p>
      <h1 className="mt-1 font-display text-5xl font-semibold uppercase tracking-wide md:text-6xl">NEW RELEASES</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Fresh UK electronic — preview here, buy WAV/MP3 on Beatport or Bandcamp. Last 90 days. No fillers.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {GENRE_CRATES.map((c) => (
          <Link
            key={c.slug}
            to="/genre/$slug"
            params={{ slug: c.slug }}
            className="rounded-sm border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-fg"
          >
            {c.name}
          </Link>
        ))}
      </div>
      {packs.map((p) => (
        <Section key={p.slug} title={p.name}>
          <MixGrid>
            {p.mixes.map((m) => (
              <ChartCard key={m.id} mix={m} queue={p.mixes.map((x) => x.id)} />
            ))}
          </MixGrid>
        </Section>
      ))}
    </div>
  );
}

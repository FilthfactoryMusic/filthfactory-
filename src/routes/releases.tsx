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
        content: "New UK garage, drum and bass, jungle, grime, bassline. 30s preview. One bag: WAV, MP3 or FLAC.",
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
      <p className="text-xs uppercase tracking-[0.25em] text-accent">The desk · 30s · one bag</p>
      <h1 className="mt-1 font-display text-5xl font-semibold uppercase tracking-wide md:text-6xl">NEW RELEASES</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Last 90 days. Preview here. Buy the file once — WAV, MP3 or FLAC. No paying twice for the same cut. Then go live next door.
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

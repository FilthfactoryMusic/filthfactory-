import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChartCard } from "@/components/chart-card";
import { MixGrid } from "@/components/section";
import { rememberCharts } from "@/lib/chart-cache";
import { loadGenreReleases } from "@/lib/catalogue-api";

export const Route = createFileRoute("/genre/$slug")({
  loader: ({ params }) => loadGenreReleases({ data: { slug: params.slug } }),
  component: GenrePage,
});

function GenrePage() {
  const { name, mixes } = Route.useLoaderData();
  const queue = mixes.map((m) => m.id);
  useEffect(() => {
    rememberCharts(mixes);
  }, [mixes]);

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted">Crate</p>
      <h1 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">{name}</h1>
      <p className="mt-2 text-sm text-muted">
        Real releases. 30s preview. One bag: WAV, MP3 or FLAC. Last 90 days where the date is known.
      </p>
      <div className="mt-8">
        {mixes.length ? (
          <MixGrid>
            {mixes.map((m) => (
              <ChartCard key={m.id} mix={m} queue={queue} />
            ))}
          </MixGrid>
        ) : (
          <p className="text-muted">Nothing fresh in this crate right now.</p>
        )}
      </div>
    </div>
  );
}

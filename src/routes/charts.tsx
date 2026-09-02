import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChartCard } from "@/components/chart-card";
import { MixGrid } from "@/components/section";
import { rememberCharts } from "@/lib/chart-cache";
import { formatChartWeek } from "@/lib/chart-week";
import { useUkCharts } from "@/lib/use-uk-charts";
import { useWow } from "@/lib/use-wow";
import { WOW_ARTISTS, WOW_LABELS } from "@/lib/wow-scan";

export const Route = createFileRoute("/charts")({ component: ChartsPage });

function ChartsPage() {
  const { featured, trending, weekId, loading } = useUkCharts();
  const wow = useWow();
  const ukgQ = featured.map((m) => m.id);
  const dnbQ = trending.map((m) => m.id);
  const faces = (wow.digest?.items ?? []).filter((i) => i.kind === "artist" || i.kind === "label");
  useEffect(() => {
    rememberCharts([...featured, ...trending]);
  }, [featured, trending]);

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-10">
        <div>
          <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">UK charts</h1>
          <p className="mt-1 text-sm text-muted">
            UK garage and drum & bass. New lock every Friday 00:00 UK
            {weekId ? ` · this week from ${formatChartWeek(weekId)}` : ""}. 30s previews. Full tracks on Spotify and
            Beatport.
          </p>
        </div>

        <section>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">UK Garage / Bassline</h2>
          <p className="mt-1 text-sm text-muted">
            <a
              className="underline underline-offset-4"
              href="https://www.beatport.com/genre/uk-garage-bassline/86/top-100"
              target="_blank"
              rel="noreferrer"
            >
              Beatport Top 100
            </a>
            {" · "}
            <a
              className="underline underline-offset-4"
              href="https://open.spotify.com/playlist/0aZafWESOg0baCyD07P8dn"
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-muted">Loading chart…</p>
          ) : (
            <div className="mt-4">
              <MixGrid>
                {featured.map((m) => (
                  <ChartCard key={m.id} mix={m} queue={ukgQ} />
                ))}
              </MixGrid>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Drum & Bass</h2>
          <p className="mt-1 text-sm text-muted">
            <a
              className="underline underline-offset-4"
              href="https://www.beatport.com/genre/drum-and-bass/1/top-100"
              target="_blank"
              rel="noreferrer"
            >
              Beatport Top 100
            </a>
            {" · "}
            <a
              className="underline underline-offset-4"
              href="https://open.spotify.com/search/drum%20and%20bass"
              target="_blank"
              rel="noreferrer"
            >
              Spotify
            </a>
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-muted">Loading chart…</p>
          ) : (
            <div className="mt-4">
              <MixGrid>
                {trending.map((m) => (
                  <ChartCard key={m.id} mix={m} queue={dnbQ} />
                ))}
              </MixGrid>
            </div>
          )}
        </section>
      </div>
      <aside>
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">On the desk</h2>
        <ul className="mt-4 space-y-3">
          {[...WOW_ARTISTS, ...WOW_LABELS].map((row) => {
            const face = faces.find((f) => f.name === row.name);
            return (
              <li key={row.name}>
                <a
                  href={face?.url ?? `https://www.songkick.com/search?query=${encodeURIComponent(row.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3"
                >
                  <img
                    src={face?.thumb || "/art/brand/logo.png"}
                    alt=""
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{row.name}</span>
                    <span className="text-xs text-muted">{face?.blurb ?? face?.genre ?? "UK"}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

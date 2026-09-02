import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Radio } from "lucide-react";
import { LiveCard } from "@/components/live-card";
import { ChartCard } from "@/components/chart-card";
import { BeatportBag } from "@/components/beatport-bag";
import { MixGrid, Section } from "@/components/section";
import { CITIES, GENRE_SLUGS, getDj } from "@/lib/catalog";
import { mergeLiveNow, useCommunityLive } from "@/lib/use-community-live";
import { usePlayer } from "@/lib/player-store";
import { formatCount } from "@/lib/utils";
import { FaceMarquee } from "@/components/face-marquee";
import { LiveDot } from "@/components/live-dot";
import { useMyBlocks } from "@/lib/use-blocks";
import { formatChartWeek } from "@/lib/chart-week";
import { loadUkCharts } from "@/lib/charts-api";
import { rememberCharts } from "@/lib/chart-cache";
import { useUkCharts } from "@/lib/use-uk-charts";
import { useWow } from "@/lib/use-wow";

export const Route = createFileRoute("/")({
  loader: () => loadUkCharts().catch(() => ({ weekId: "", featured: [], trending: [] })),
  component: Home,
  head: () => ({
    meta: [
      { title: "Filthfactory — Put ya cans on" },
      {
        name: "description",
        content:
          "UK garage, grime, bassline, 140, DnB, tech house. Live rooms. Free to listen. £5/month to go live. 18+.",
      },
    ],
  }),
});

function Home() {
  const preloaded = Route.useLoaderData();
  const community = useCommunityLive();
  const blocked = useMyBlocks();
  const live = mergeLiveNow(community).filter(
    (s) => !blocked.has(s.djId) && !blocked.has(s.hostUserId),
  );
  const advertised = live.filter((s) => s.advertised);
  const restLive = live.filter((s) => !s.advertised);
  const hook = useUkCharts();
  const featured = hook.featured.length ? hook.featured : preloaded.featured;
  const trending = hook.trending.length ? hook.trending : preloaded.trending;
  const loading = hook.loading && !preloaded.featured.length;
  const error = hook.error && !preloaded.featured.length;
  const weekId = hook.weekId || preloaded.weekId;
  const wow = useWow();
  useEffect(() => {
    rememberCharts([...preloaded.featured, ...preloaded.trending]);
  }, [preloaded]);
  const featuredIds = featured.map((m) => m.id);
  const trendIds = trending.map((m) => m.id);
  const playLive = usePlayer((s) => s.playLive);
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const lead = advertised[0];
  const leadDj = lead ? getDj(lead.djId) : undefined;
  const leadActive = lead ? now?.kind === "live" && now.id === lead.id && playing : false;

  return (
    <div className="enter-up">
      <section className="relative overflow-hidden rounded-lg border border-border bg-surface">
        <img
          src="/campaign/hero-bg.jpg"
          alt=""
          className="aspect-[16/11] w-full object-cover md:aspect-[21/9] md:max-h-[400px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-center md:p-10">
          <img src="/art/brand/logo.png" alt="Filthfactory" className="mx-auto size-20 md:size-28" />
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-live-fg">18+ · UK · free to listen</p>
          <h1 className="mt-2 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-fg md:text-4xl">
            Put ya cans on.
            <br />
            Turn it up.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Garage, grime, bassline, 140, DnB, tech house. Tap a room. That's it. Fiver a month if you wanna go live.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/live"
              className="inline-flex h-11 items-center rounded-sm bg-live px-5 text-sm font-medium text-live-fg"
            >
              What's on now
            </Link>
            <Link
              to="/wow"
              className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-sm font-medium text-accent-fg"
            >
              Who's on what
            </Link>
            <Link
              to="/booth"
              className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm font-medium hover:border-accent"
            >
              Go live
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-live">WOW</p>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-wide">Who's on what</h2>
            <p className="mt-1 text-sm text-muted">UK DJs and MCs — garage, grime, bassline, 140, DnB, tech house. Faces scroll. Tap one.</p>
          </div>
          <Link to="/wow" className="hidden text-sm text-muted hover:text-fg sm:block">
            Full desk
          </Link>
        </div>
        {wow.loading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="size-28 shrink-0 animate-pulse rounded-full bg-surface sm:size-32" />
            ))}
          </div>
        ) : (
          <FaceMarquee
            faces={(wow.digest?.items ?? []).filter((i) => i.kind === "artist" && i.thumb)}
          />
        )}
      </section>

      {lead ? (
        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted">Advertised on the feed</p>
          <h2 className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide">Featured live</h2>
          <article className="mt-4 overflow-hidden rounded-lg border border-border bg-surface md:grid md:grid-cols-2">
            <Link to="/live/$id" params={{ id: lead.id }} className="relative block">
              <img src={lead.artwork} alt="" className="aspect-video w-full bg-bg object-contain" />
              <div className="absolute left-3 top-3 flex items-center gap-1">
                <LiveDot />
                <span className="rounded-sm bg-accent px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-accent-fg">
                  Advertised
                </span>
              </div>
              <div className="absolute bottom-3 left-3 rounded-sm bg-bg/70 px-2 py-0.5 text-xs text-fg tabular-nums">
                {formatCount(lead.listeners)} listening
              </div>
            </Link>
            <div className="flex flex-col justify-center p-5 md:p-8">
              <Link to="/live/$id" params={{ id: lead.id }}>
                <h3 className="font-display text-2xl font-semibold uppercase tracking-wide md:text-3xl">
                  {lead.title}
                </h3>
              </Link>
              <p className="mt-2 text-sm text-muted">
                {leadDj?.name ?? lead.hostName} · {lead.venue} · {lead.city}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{lead.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => playLive(lead.id)}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-live px-4 text-sm font-medium text-live-fg"
                >
                  <Radio className="size-4" />
                  {leadActive ? "Listening" : "Tune in"}
                </button>
                <Link
                  to="/membership"
                  className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm hover:border-accent"
                >
                  Advertise your live
                </Link>
              </div>
            </div>
          </article>
          {advertised.slice(1).length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {advertised.slice(1).map((s) => (
                <LiveCard key={s.id} show={s} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <Section title="Live now" to="/live">
        <div className="grid gap-4 md:grid-cols-3">
          {restLive.map((s) => (
            <LiveCard key={s.id} show={s} />
          ))}
        </div>
      </Section>

      <Section title="Cities">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              to="/city/$slug"
              params={{ slug: c.slug }}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-fg"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </Section>

      <section className="mt-10 rounded-sm border border-accent/40 bg-raised p-5 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">30s preview · WAV/MP3</p>
            <h2 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide md:text-5xl">
              NEW RELEASES
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              UK garage, bassline, drum & bass. Preview here. Buy the files on Beatport.
              {weekId ? ` Week of ${formatChartWeek(weekId)}.` : ""}
            </p>
          </div>
          <Link
            to="/releases"
            className="inline-flex h-12 items-center rounded-sm bg-accent px-6 font-display text-sm font-semibold uppercase tracking-wide text-accent-fg"
          >
            Open NEW RELEASES
          </Link>
        </div>
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-sm bg-surface" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-6 text-sm text-muted">Charts are taking a minute. Try Spotify or Beatport directly.</p>
        ) : (
          <div className="mt-6">
            <MixGrid>
              {[...featured, ...trending].slice(0, 10).map((m) => (
                <ChartCard key={m.id} mix={m} queue={[...featuredIds, ...trendIds]} />
              ))}
            </MixGrid>
          </div>
        )}
      </section>

      <Section title="Your bag" to="/library">
        <BeatportBag compact />
      </Section>

      <Section title="Lanes">
        <div className="flex flex-wrap gap-2">
          {GENRE_SLUGS.map((g) => (
            <Link
              key={g.slug}
              to="/genre/$slug"
              params={{ slug: g.slug }}
              className="rounded-sm bg-raised px-3 py-1.5 text-sm text-muted hover:text-fg"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

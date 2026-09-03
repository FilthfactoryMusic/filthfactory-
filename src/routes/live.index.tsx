import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandedText } from "@/components/brand-mark";
import { LiveCard } from "@/components/live-card";
import { LiveDot } from "@/components/live-dot";
import { getDj, liveUpcoming } from "@/lib/catalog";
import { mergeLiveNow, useCommunityLive } from "@/lib/use-community-live";
import { useLibrary } from "@/lib/library-store";
import { usePlayer } from "@/lib/player-store";
import { useMyBlocks } from "@/lib/use-blocks";
import { useJustLive } from "@/lib/use-just-live";

export const Route = createFileRoute("/live/")({ component: LivePage });

function formatWhen(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LivePage() {
  const community = useCommunityLive();
  const blocked = useMyBlocks();
  const live = mergeLiveNow(community).filter(
    (s) => !blocked.has(s.djId) && !blocked.has(s.hostUserId),
  );
  const advertised = live.filter((s) => s.advertised);
  const restLive = live.filter((s) => !s.advertised);
  const upcoming = liveUpcoming();
  const ownLive = useLibrary((s) => s.ownLive);
  const playLive = usePlayer((s) => s.playLive);
  const { picks, scannedAt, loading } = useJustLive();

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold uppercase tracking-wide">On air</h1>
          <p className="mt-1 text-sm text-muted">
            <BrandedText text="Groove London, Thames Delta, Radio Respect, Code Red, Rinse, Flex. Or jump on the booth yourself." />
          </p>
        </div>
        <Link to="/booth" className="hidden h-11 items-center rounded-md bg-live px-4 text-sm font-medium text-live-fg sm:flex">
          Go live
        </Link>
      </div>

      {ownLive ? (
        <div className="mt-6 rounded-lg border border-live/40 bg-raised p-4">
          <div className="flex items-center gap-2">
            <LiveDot />
            <p className="text-sm font-medium">Your broadcast is on air</p>
          </div>
          <p className="mt-1 text-sm text-muted">{ownLive.title}</p>
          <button
            type="button"
            onClick={() => playLive(ownLive.id)}
            className="mt-3 h-11 rounded-md bg-live px-4 text-sm font-medium text-live-fg"
          >
            Listen back
          </button>
        </div>
      ) : null}

      {advertised.length ? (
        <>
          <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">Advertised</h2>
          <p className="mt-1 text-sm text-muted">
            Featured members.{" "}
            <Link to="/membership" className="underline underline-offset-4">
              Advertise your stream
            </Link>
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {advertised.map((s) => (
              <LiveCard key={s.id} show={s} />
            ))}
          </div>
        </>
      ) : null}

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">On air</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {restLive.map((s) => (
          <LiveCard key={s.id} show={s} />
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">Just gone live</h2>
      <p className="mt-1 text-sm text-muted">
        Scans YouTube and Mixcloud every 30 minutes. Official thumbs and links — we don't steal the stream.
        TikTok is a live search because they don't let apps scrape desks.
        {scannedAt ? ` Last scan ${new Date(scannedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.` : ""}
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-muted">Scanning desks…</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-sm bg-surface"
            >
              <img src={p.thumb} alt="" className="aspect-video w-full object-cover" />
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  {p.source} · {p.genre}
                </p>
                <p className="mt-1 truncate text-sm font-medium group-hover:underline">
                  <BrandedText text={p.title} />
                </p>
                <p className="truncate text-xs text-muted">
                  <BrandedText text={p.dj} />
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-faint">{p.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {upcoming.length ? (
        <>
          <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">Upcoming</h2>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {upcoming.map((s) => {
              const dj = getDj(s.djId);
              return (
                <li key={s.id} className="flex items-center gap-3 p-3">
                  <img src={s.artwork} alt="" className="size-14 rounded-sm object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="truncate text-xs text-muted">
                      {dj?.name} · {s.venue}
                    </p>
                  </div>
                  <span className="text-xs text-faint tabular-nums">{formatWhen(s.startsAt)}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

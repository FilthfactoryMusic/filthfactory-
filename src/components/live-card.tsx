import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { LiveDot } from "@/components/live-dot";
import { BrandedText } from "@/components/brand-mark";
import { getDj } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import type { LiveShow } from "@/lib/types";
import { formatCount } from "@/lib/utils";

export function LiveCard({ show }: { show: LiveShow }) {
  const dj = getDj(show.djId);
  const playLive = usePlayer((s) => s.playLive);
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const active = now?.kind === "live" && now.id === show.id && playing;

  return (
    <article className="min-w-0">
      <Link
        to="/live/$id"
        params={{ id: show.id }}
        className="relative block overflow-hidden rounded-sm bg-surface"
      >
        <img src={show.artwork} alt="" className="aspect-video w-full bg-bg object-contain" />
        <div className="absolute left-2 top-2 flex items-center gap-1">
          <LiveDot />
          {show.advertised ? (
            <span className="rounded-sm bg-accent px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-accent-fg">
              Advertised
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-2 left-2 rounded-sm bg-bg/70 px-2 py-0.5 text-xs text-fg tabular-nums">
          {formatCount(show.listeners)} listening
        </div>
      </Link>
      <div className="mt-2 flex items-start gap-2">
        {dj ? (
          <Link to="/dj/$id" params={{ id: dj.id }} className="mt-0.5 size-8 shrink-0 overflow-hidden rounded-full">
            <img src={dj.photo} alt="" className="size-full object-cover" />
          </Link>
        ) : (
          <img src={show.artwork} alt="" className="mt-0.5 size-8 shrink-0 rounded-full object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <Link
            to="/live/$id"
            params={{ id: show.id }}
            className="block truncate text-sm font-medium hover:underline"
          >
            <BrandedText text={show.title} />
          </Link>
          <p className="truncate text-xs text-muted">
            <BrandedText text={`${dj?.name ?? show.hostName ?? "Resident"} · ${show.venue}`} />
          </p>
          {show.streamUrl ? (
            <button
              type="button"
              onClick={() => playLive(show.id)}
              className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-sm bg-live px-3 text-xs font-medium text-live-fg"
            >
              <Radio className="size-3.5" />
              {active ? "Listening" : "Tune in"}
            </button>
          ) : (
            <Link
              to="/live/$id"
              params={{ id: show.id }}
              className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-sm bg-live px-3 text-xs font-medium text-live-fg"
            >
              Watch
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

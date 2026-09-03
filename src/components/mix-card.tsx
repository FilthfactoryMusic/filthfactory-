import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { BrandedText } from "@/components/brand-mark";
import { getDj } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import type { Mix } from "@/lib/types";
import { cn, formatCount, formatDuration } from "@/lib/utils";

export function MixCard({ mix, queue }: { mix: Mix; queue?: string[] }) {
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const playMix = usePlayer((s) => s.playMix);
  const toggle = usePlayer((s) => s.toggle);
  const dj = getDj(mix.djId);
  const active = now?.kind === "mix" && now.id === mix.id;
  const isOn = active && playing;

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-sm bg-surface">
        <Link to="/mix/$id" params={{ id: mix.id }} className="block aspect-square">
          <img src={mix.artwork} alt="" className="size-full object-cover" />
        </Link>
        <button
          type="button"
          aria-label={isOn ? "Pause" : "Play"}
          onClick={() => (active ? toggle() : playMix(mix.id, { queue }))}
          className={cn(
            "absolute bottom-2 right-2 flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-md transition-opacity duration-150",
            isOn ? "opacity-100" : "opacity-0 group-hover:opacity-100 max-md:opacity-100",
          )}
        >
          {isOn ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
        </button>
      </div>
      <div className="mt-2 min-w-0">
        <Link
          to="/mix/$id"
          params={{ id: mix.id }}
          className="block truncate text-sm font-medium text-fg hover:underline"
        >
          <BrandedText text={mix.title} />
        </Link>
        {dj ? (
          <Link
            to="/dj/$id"
            params={{ id: dj.id }}
            className="mt-0.5 block truncate text-sm text-muted hover:text-fg"
          >
            {dj.name}
          </Link>
        ) : (
          <p className="mt-0.5 truncate text-sm text-muted">
            <BrandedText text={mix.show} />
          </p>
        )}
        <p className="mt-0.5 text-xs text-faint tabular-nums">
          {formatCount(mix.plays)} plays · {formatDuration(mix.duration)}
        </p>
      </div>
    </article>
  );
}

export function MixRow({ mix, queue }: { mix: Mix; queue?: string[] }) {
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const playMix = usePlayer((s) => s.playMix);
  const toggle = usePlayer((s) => s.toggle);
  const dj = getDj(mix.djId);
  const active = now?.kind === "mix" && now.id === mix.id;
  const isOn = active && playing;

  return (
    <div className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-raised">
      <button
        type="button"
        aria-label={isOn ? "Pause" : "Play"}
        onClick={() => (active ? toggle() : playMix(mix.id, { queue }))}
        className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-surface"
      >
        <img src={mix.artwork} alt="" className="size-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-bg/40 text-fg">
          {isOn ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <Link to="/mix/$id" params={{ id: mix.id }} className="block truncate text-sm font-medium hover:underline">
          {mix.title}
        </Link>
        <p className="truncate text-xs text-muted">
          {dj?.name} · {mix.city} · {mix.genres[0]}
        </p>
      </div>
      <span className="hidden text-xs text-faint tabular-nums sm:block">{formatDuration(mix.duration)}</span>
    </div>
  );
}

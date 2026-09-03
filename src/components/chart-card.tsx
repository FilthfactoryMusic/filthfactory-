import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { BrandMark, BrandedText } from "@/components/brand-mark";
import { rememberCharts } from "@/lib/chart-cache";
import { usePlayer } from "@/lib/player-store";
import type { Mix } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChartCard({ mix, queue }: { mix: Mix; queue?: string[] }) {
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const playMix = usePlayer((s) => s.playMix);
  const toggle = usePlayer((s) => s.toggle);
  const active = now?.kind === "mix" && now.id === mix.id;
  const isOn = active && playing;

  function play() {
    rememberCharts([mix]);
    if (active) toggle();
    else playMix(mix.id, { queue });
  }

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-sm bg-surface">
        <Link to="/mix/$id" params={{ id: mix.id }} className="block">
          <img src={mix.artwork} alt="" className="aspect-square w-full object-cover" />
        </Link>
        <span className="absolute left-2 top-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
          30s
        </span>
        <button
          type="button"
          aria-label={isOn ? "Pause" : "Play preview"}
          onClick={play}
          className={cn(
            "absolute bottom-2 right-2 flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-md transition-opacity duration-150",
            isOn ? "opacity-100" : "opacity-0 group-hover:opacity-100 max-md:opacity-100",
          )}
        >
          {isOn ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
        </button>
      </div>
      <Link to="/mix/$id" params={{ id: mix.id }} className="mt-2 block truncate text-sm font-medium hover:underline">
        <BrandedText text={mix.title} />
      </Link>
      <p className="truncate text-sm text-muted">
        <BrandedText text={mix.show} />
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-wider text-faint">
        {mix.cut ? <span className="text-muted">{mix.cut}</span> : null}
        {mix.label ? <BrandMark name={mix.label} className="truncate text-fg" /> : null}
        {mix.beatportUrl ? (
          <a href={mix.beatportUrl} target="_blank" rel="noreferrer" className="hover:text-fg">
            WAV · MP3 · FLAC
          </a>
        ) : null}
        {mix.bandcampUrl ? (
          <a href={mix.bandcampUrl} target="_blank" rel="noreferrer" className="hover:text-fg">
            Bandcamp
          </a>
        ) : null}
      </p>
    </article>
  );
}

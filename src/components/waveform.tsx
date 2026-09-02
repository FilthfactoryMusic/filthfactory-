import { peaksFromSeed } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Waveform({
  seed,
  progress,
  onSeek,
  bars = 160,
  className,
}: {
  seed: number;
  progress: number;
  onSeek?: (p: number) => void;
  bars?: number;
  className?: string;
}) {
  const peaks = peaksFromSeed(seed, bars);
  return (
    <div
      className={cn("flex h-8 w-full items-end gap-px", onSeek && "cursor-pointer", className)}
      onClick={(e) => {
        if (!onSeek) return;
        const r = e.currentTarget.getBoundingClientRect();
        onSeek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
      }}
      role={onSeek ? "slider" : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 1 : undefined}
      aria-valuenow={onSeek ? progress : undefined}
    >
      {peaks.map((p, i) => {
        const filled = i / peaks.length <= progress;
        return (
          <span
            key={i}
            className={cn("w-full min-w-px rounded-full", filled ? "bg-accent" : "bg-border")}
            style={{ height: `${Math.max(12, p * 100)}%` }}
          />
        );
      })}
    </div>
  );
}

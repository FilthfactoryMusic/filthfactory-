import { Link } from "@tanstack/react-router";
import { Heart, Pause, Play, Radio, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { BrandedText } from "@/components/brand-mark";
import { Waveform } from "@/components/waveform";
import { getDj, getLive } from "@/lib/catalog";
import { getChartMix } from "@/lib/chart-cache";
import { resolveLive, useLibrary } from "@/lib/library-store";
import { usePlayer } from "@/lib/player-store";
import { formatDuration } from "@/lib/utils";

export function PlayerBar() {
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const toggle = usePlayer((s) => s.toggle);
  const seek = usePlayer((s) => s.seek);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const tick = usePlayer((s) => s.tick);
  const likes = useLibrary((s) => s.likes);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const uploads = useLibrary((s) => s.uploads);
  const ownLive = useLibrary((s) => s.ownLive);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, tick]);

  if (!now) return null;

  const mix =
    now.kind === "mix"
      ? (getChartMix(now.id) ?? uploads.find((m) => m.id === now.id))
      : undefined;
  const live =
    now.kind === "live"
      ? (getLive(now.id) ?? resolveLive(now.id) ?? (ownLive?.id === now.id ? ownLive : undefined))
      : undefined;
  const dj = getDj((mix?.djId ?? live?.djId) as string);
  const artwork = mix?.artwork ?? live?.artwork ?? dj?.photo ?? "";
  const title = mix?.title ?? live?.title ?? "Filthfactory";
  const seed = mix?.seed ?? live?.seed ?? 1;
  const liked = mix ? likes.includes(mix.id) : false;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-surface/95 backdrop-blur-sm md:bottom-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 md:h-18 md:gap-4 md:px-6">
        <Link to={now.kind === "mix" ? "/mix/$id" : "/live/$id"} params={{ id: now.id }} className="flex min-w-0 items-center gap-3">
          <img src={artwork} alt="" className="size-11 rounded-sm object-cover md:size-12" />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 truncate text-sm font-medium">
              {now.kind === "live" ? <Radio className="size-3.5 shrink-0 text-live" /> : null}
              <BrandedText text={title} />
            </span>
            <span className="block truncate text-xs text-muted">
              <BrandedText text={dj?.name ?? mix?.show ?? ""} />
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {now.kind === "mix" ? (
            <button type="button" aria-label="Previous" onClick={prev} className="hidden size-11 items-center justify-center text-muted hover:text-fg md:flex">
              <SkipBack className="size-4 fill-current" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg"
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
          {now.kind === "mix" ? (
            <button type="button" aria-label="Next" onClick={next} className="hidden size-11 items-center justify-center text-muted hover:text-fg md:flex">
              <SkipForward className="size-4 fill-current" />
            </button>
          ) : null}
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <span className="w-10 text-right text-xs text-faint tabular-nums">{formatDuration(currentTime)}</span>
          <Waveform
            seed={seed}
            progress={duration ? currentTime / duration : 0}
            onSeek={now.kind === "mix" ? (p) => seek(p * duration) : undefined}
            className="h-9"
          />
          <span className="w-10 text-xs text-faint tabular-nums">{formatDuration(duration)}</span>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {mix ? (
            <button
              type="button"
              aria-label={liked ? "Unlike" : "Like"}
              onClick={() => toggleLike(mix.id)}
              className="flex size-11 items-center justify-center text-muted hover:text-fg"
            >
              <Heart className={`size-4 ${liked ? "fill-live text-live" : ""}`} />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={toggleMute}
            className="hidden size-11 items-center justify-center text-muted hover:text-fg md:flex"
          >
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="hidden w-20 accent-accent md:block"
            aria-label="Volume"
          />
        </div>
      </div>
      <div className="h-1 bg-border md:hidden">
        <div
          className="h-full bg-accent"
          style={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}

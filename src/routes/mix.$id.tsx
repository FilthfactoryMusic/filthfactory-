import { createFileRoute } from "@tanstack/react-router";
import { Clock, Heart, Pause, Play, Share2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Waveform } from "@/components/waveform";
import { rememberCharts, getChartMix } from "@/lib/chart-cache";
import { loadCatalogueTrack } from "@/lib/catalogue-api";
import { mixCredit } from "@/lib/feeds";
import { useLibrary } from "@/lib/library-store";
import { usePlayer } from "@/lib/player-store";
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import { ReportControl } from "@/components/report-control";

export const Route = createFileRoute("/mix/$id")({
  loader: ({ params }) => loadCatalogueTrack({ data: params.id }),
  component: MixPage,
});

function MixPage() {
  const { id } = Route.useParams();
  const loaded = Route.useLoaderData();
  const uploads = useLibrary((s) => s.uploads);
  const mix = loaded ?? getChartMix(id) ?? uploads.find((m) => m.id === id);
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const currentTime = usePlayer((s) => s.currentTime);
  const playMix = usePlayer((s) => s.playMix);
  const toggle = usePlayer((s) => s.toggle);
  const seek = usePlayer((s) => s.seek);
  const likes = useLibrary((s) => s.likes);
  const later = useLibrary((s) => s.later);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const toggleLater = useLibrary((s) => s.toggleLater);

  useEffect(() => {
    if (loaded) rememberCharts([loaded]);
  }, [loaded]);

  if (!mix) return <p className="text-muted">Release not found. Search the crate.</p>;

  const mixId = mix.id;
  const active = now?.kind === "mix" && now.id === mixId;
  const isOn = active && playing;
  const t = active ? currentTime : 0;

  async function share() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast(url);
    }
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-[minmax(0,280px)_1fr] lg:grid-cols-[minmax(0,340px)_1fr]">
        <img src={mix.artwork} alt="" className="aspect-square w-full rounded-sm object-cover" />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">{mix.genres[0] ?? "Release"}</p>
          <h1 className="mt-1 font-display text-4xl font-semibold uppercase leading-none tracking-wide md:text-5xl">
            {mix.title}
          </h1>
          <p className="mt-4 text-lg">{mix.show}</p>
          <p className="mt-3 text-sm text-muted">{mix.description}</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted">{mixCredit(mix)}</p>
          <p className="mt-2 text-xs text-faint tabular-nums">{formatDuration(mix.duration)} preview</p>

          <div className="mt-5">
            <Waveform
              seed={mix.seed}
              progress={mix.duration ? t / mix.duration : 0}
              onSeek={(p) => {
                if (!active) playMix(mix.id);
                seek(p * mix.duration);
              }}
              bars={200}
              className="h-12"
            />
            <div className="mt-1 flex justify-between text-xs text-faint tabular-nums">
              <span>{formatDuration(t)}</span>
              <span>{formatDuration(mix.duration)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => (active ? toggle() : playMix(mix.id))}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg"
            >
              {isOn ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
              {isOn ? "Pause" : "Preview"}
            </button>
            {mix.beatportUrl ? (
              <a
                href={mix.beatportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center rounded-md bg-live px-5 text-sm font-medium text-live-fg"
              >
                Buy WAV/MP3
              </a>
            ) : null}
            {mix.spotifyUrl ? (
              <a
                href={mix.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm"
              >
                Spotify
              </a>
            ) : null}
            <IconAction active={likes.includes(mix.id)} onClick={() => toggleLike(mix.id)} label="Like">
              <Heart className={`size-4 ${likes.includes(mix.id) ? "fill-live text-live" : ""}`} />
            </IconAction>
            <IconAction active={later.includes(mix.id)} onClick={() => toggleLater(mix.id)} label="Later">
              <Clock className="size-4" />
            </IconAction>
            <IconAction onClick={share} label="Share">
              <Share2 className="size-4" />
            </IconAction>
          </div>
          <div className="mt-4">
            <ReportControl targetType="mix" targetId={mixId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IconAction({
  children,
  onClick,
  label,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-11 items-center justify-center rounded-md border border-border ${active ? "bg-raised" : ""}`}
    >
      {children}
    </button>
  );
}

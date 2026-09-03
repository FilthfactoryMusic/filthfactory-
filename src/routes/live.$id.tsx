import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BroadcastStage } from "@/components/broadcast-stage";
import { LiveDot } from "@/components/live-dot";
import { CHAT_SEED, currentTrack, getDj, getLive, liveOffsetSec, mixesByDj } from "@/lib/catalog";
import { resolveLive, useLibrary, EMPTY_CHAT } from "@/lib/library-store";
import { loadBoothLive } from "@/lib/stream-api";
import { isBoothBroadcast } from "@/lib/viewer-id";
import { usePlayer } from "@/lib/player-store";
import { MixCard } from "@/components/mix-card";
import { MixGrid } from "@/components/section";
import { Input } from "@/components/ui/input";
import { formatCount } from "@/lib/utils";
import { GiftBar } from "@/components/gift-bar";
import { ReportControl } from "@/components/report-control";
import { StealFlyer } from "@/components/steal-flyer";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { LiveShow } from "@/lib/types";

export const Route = createFileRoute("/live/$id")({ component: LiveShowPage });

function LiveShowPage() {
  const { id } = Route.useParams();
  const catalog = getLive(id);
  const ownLive = useLibrary((s) => s.ownLive);
  const communityLive = useLibrary((s) => s.communityLive);
  const { user } = useCurrentUserState();
  const [fetched, setFetched] = useState<LiveShow | null>(null);

  useEffect(() => {
    if (!isBoothBroadcast(id)) return;
    void loadBoothLive({ data: { id } })
      .then((row) => setFetched(row))
      .catch(() => setFetched(null));
  }, [id]);

  const show =
    fetched ??
    catalog ??
    (ownLive?.id === id ? ownLive : undefined) ??
    communityLive.find((s) => s.id === id) ??
    resolveLive(id);
  const dj = show ? getDj(show.djId) : undefined;
  const playLive = usePlayer((s) => s.playLive);
  const now = usePlayer((s) => s.now);
  const playing = usePlayer((s) => s.playing);
  const currentTime = usePlayer((s) => s.currentTime);
  const follows = useLibrary((s) => s.follows);
  const toggleFollow = useLibrary((s) => s.toggleFollow);
  const userChat = useLibrary((s) => s.chat[id] ?? EMPTY_CHAT);
  const addChat = useLibrary((s) => s.addChat);
  const [listeners, setListeners] = useState(show?.listeners ?? 0);
  const isHost = ownLive?.id === id || Boolean(user && show?.hostUserId === user.id);
  const booth = Boolean(show && isBoothBroadcast(show.id));
  const listening = now?.kind === "live" && now.id === show?.id && playing;

  useEffect(() => {
    if (show?.listeners) setListeners(show.listeners);
  }, [show?.listeners]);

  useEffect(() => {
    if (!show || show.status !== "live" || booth) return;
    const t = setInterval(() => {
      setListeners((n) => n + (Math.random() > 0.55 ? 1 : -1) * (Math.random() > 0.8 ? 3 : 1));
    }, 2400);
    return () => clearInterval(t);
  }, [show, booth]);

  const seedChat = CHAT_SEED[id] ?? EMPTY_CHAT;
  const seeded = useMemo(() => {
    return seedChat.map((m, i) => ({
      id: `s-${i}`,
      user: m.user,
      text: m.text,
      at: Date.now() - (seedChat.length - i) * 40000,
    }));
  }, [seedChat]);

  if (!show) {
    return <p className="text-muted">This broadcast has ended.</p>;
  }

  const t = listening ? currentTime : liveOffsetSec(show);
  const track = booth ? null : currentTrack(show.tracklist, t);
  const more = dj ? mixesByDj(dj.id) : [];

  function onChat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = String(new FormData(e.currentTarget).get("msg") ?? "").trim();
    if (!text) return;
    addChat(id, text);
    e.currentTarget.reset();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {booth ? (
          <BroadcastStage
            liveId={show.id}
            isHost={isHost}
            hasCamera={Boolean(show.hasCamera)}
            artwork={show.artwork}
            title={show.title}
            enabled={listening || isHost || booth}
            onNeedGesture={() => playLive(show.id)}
          />
        ) : (
          <div className="relative overflow-hidden rounded-sm bg-surface">
            {show.embedUrl ? (
              <iframe
                title={show.title}
                src={show.embedUrl}
                className="aspect-video w-full bg-bg"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <img src={show.artwork} alt="" className="aspect-video w-full bg-bg object-contain" />
            )}
            <div className="absolute left-3 top-3">
              {show.status === "live" ? <LiveDot /> : (
                <span className="rounded-sm bg-raised px-2 py-0.5 text-xs">Upcoming</span>
              )}
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-start gap-4">
          {dj ? (
            <Link to="/dj/$id" params={{ id: dj.id }} className="size-14 overflow-hidden rounded-full">
              <img src={dj.photo} alt="" className="size-full object-cover" />
            </Link>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">{show.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {dj?.name ?? show.hostName} · {show.venue} · {show.city}
            </p>
            <p className="mt-3 text-sm text-muted">{show.description}</p>
            {track ? <p className="mt-3 text-sm text-fg">Now playing: {track.title}</p> : null}
            {show.credit ? <p className="mt-2 text-xs uppercase tracking-widest text-muted">{show.credit}</p> : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => playLive(show.id)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-live px-4 text-sm font-medium text-live-fg"
          >
            <Radio className="size-4" />
            {listening ? "Listening" : "Tune in"}
          </button>
          {show.watchUrl ? (
            <a
              href={show.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm"
            >
              Open station
            </a>
          ) : null}
          {dj ? (
            <button
              type="button"
              onClick={() => toggleFollow(dj.id)}
              className="h-11 rounded-md border border-border px-4 text-sm"
            >
              {follows.includes(dj.id) ? "Following" : "Follow"}
            </button>
          ) : null}
          <StealFlyer
            title={show.title}
            kicker={dj?.name ?? show.city}
            sub={`${show.venue} · ${show.city}`}
            artwork={show.artwork}
            live={show.status === "live"}
          />
          <span className="flex h-11 items-center text-sm text-muted tabular-nums">
            {formatCount(Math.max(1, listeners))} listening
          </span>
        </div>
        {show.advertised ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-muted">
            Advertised on Discover · Featured member
          </p>
        ) : null}
        {isHost && booth ? (
          <p className="mt-3 text-sm text-muted">Keep this tab open. Closing it drops the booth.</p>
        ) : null}
        <div className="mt-4">
          <ReportControl
            targetType="live"
            targetId={show.id}
            blockId={show.hostUserId ?? show.djId}
          />
        </div>
      </div>

      <div className="space-y-6">
        <GiftBar
          liveId={show.id}
          isHost={isHost}
          hostName={dj?.name ?? show.hostName ?? "the DJ"}
        />
        <aside className="flex h-80 flex-col rounded-lg border border-border bg-surface lg:min-h-96">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Live chat</div>
          <ul className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {[...seeded, ...userChat].map((m) => (
              <li key={m.id}>
                <span className="text-muted">{m.user}</span>
                <span className="ml-2 text-fg">{m.text}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={onChat} className="border-t border-border p-3">
            <Input name="msg" placeholder="Say something" autoComplete="off" />
          </form>
        </aside>
      </div>

      {more.length ? (
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">From the archive</h2>
          <div className="mt-4">
            <MixGrid>
              {more.map((m) => (
                <MixCard key={m.id} mix={m} queue={more.map((x) => x.id)} />
              ))}
            </MixGrid>
          </div>
        </div>
      ) : null}
    </div>
  );
}

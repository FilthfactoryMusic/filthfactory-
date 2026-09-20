import { useEffect, useRef, useState, type FormEvent } from "react";
import { getStationLoop, setStationLoop } from "@/lib/loop-api";
import { DEFAULT_LOOP_TITLE, DEFAULT_LOOP_URL, parseLoopUrl } from "@/lib/factory-loop";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveDot } from "@/components/live-dot";
import { LogoStage } from "@/components/logo-stage";

export function FactoryLoop({ canSet = false }: { canSet?: boolean }) {
  const user = useCurrentUser();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState(DEFAULT_LOOP_URL);
  const [title, setTitle] = useState(DEFAULT_LOOP_TITLE);
  const [draft, setDraft] = useState(DEFAULT_LOOP_URL);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const play = parseLoopUrl(url);
  const hasAudio = play?.kind === "audio" || play?.kind === "clip" || play?.kind === "mixcloud";
  const blockedYt = play?.kind === "youtube";

  useEffect(() => {
    void getStationLoop()
      .then((row) => {
        setUrl(row.url || DEFAULT_LOOP_URL);
        setTitle(row.title || DEFAULT_LOOP_TITLE);
        setDraft(row.url || DEFAULT_LOOP_URL);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = play?.kind === "clip" ? videoRef.current : audioRef.current;
    if (!el) return;
    el.loop = true;
    const mark = () => setOn(!el.paused);
    el.addEventListener("play", mark);
    el.addEventListener("pause", mark);
    el.addEventListener("ended", mark);
    return () => {
      el.removeEventListener("play", mark);
      el.removeEventListener("pause", mark);
      el.removeEventListener("ended", mark);
    };
  }, [play?.kind, play?.src]);

  function toggle() {
    const el = play?.kind === "clip" ? videoRef.current : audioRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => setErr("Tap play on the bar if the phone blocked autoplay."));
    else el.pause();
  }

  async function onSet(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const row = await setStationLoop({ data: { url: draft, title } });
      setUrl(row.url);
      setTitle(row.title);
    } catch {
      setErr("Need Mixcloud, Dropbox, mp3/m4a or mp4. YouTube embeds are blocked. Sign in first.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        {hasAudio ? <LiveDot /> : <p className="text-xs uppercase tracking-[0.25em] text-live">24/7</p>}
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{title}</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted">Audio on loop. Logo spins. Tap the stamp to play.</p>
      <button
        type="button"
        onClick={toggle}
        className="relative mt-4 block w-full overflow-hidden rounded-sm bg-black text-left"
        aria-label={on ? "Pause loop" : "Play loop"}
      >
        <LogoStage label={on ? "On air · audio" : "Tap to play"} />
        {hasAudio ? (
          <div className="absolute left-3 top-3">
            <LiveDot />
          </div>
        ) : null}
      </button>
      {play?.kind === "audio" ? (
        <audio ref={audioRef} className="mt-3 w-full" src={play.src} controls loop preload="metadata" />
      ) : play?.kind === "clip" ? (
        <video
          ref={videoRef}
          className="mt-3 h-12 w-full bg-black object-cover"
          src={play.src}
          controls
          loop
          playsInline
          preload="metadata"
        />
      ) : play?.kind === "mixcloud" ? (
        <iframe
          title={title}
          src={play.src}
          className="mt-3 h-16 w-full rounded-sm bg-black"
          allow="autoplay; encrypted-media"
        />
      ) : blockedYt ? (
        <p className="mt-3 text-sm text-muted">YouTube blocked that video on other sites. Use Dropbox, Mixcloud or mp3.</p>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing on the loop yet.</p>
      )}
      {canSet && user ? (
        <form onSubmit={(e) => void onSet(e)} className="mt-4 grid gap-2">
          <label className="text-sm text-muted">
            Loop URL (Dropbox / Mixcloud / mp3)
            <Input className="mt-1" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          {err ? <p className="text-sm text-live">{err}</p> : null}
          <Button type="submit" disabled={busy || !draft.trim()} className="w-fit uppercase">
            {busy ? "Saving…" : "Put on loop"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}

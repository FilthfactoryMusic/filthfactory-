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
  const [url, setUrl] = useState(DEFAULT_LOOP_URL);
  const [title, setTitle] = useState(DEFAULT_LOOP_TITLE);
  const [draft, setDraft] = useState(DEFAULT_LOOP_URL);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const play = parseLoopUrl(url) || parseLoopUrl(DEFAULT_LOOP_URL);
  const src = play?.kind === "audio" || play?.kind === "clip" ? play.src : DEFAULT_LOOP_URL;
  const hasAudio = Boolean(src) || play?.kind === "mixcloud";

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
    const el = audioRef.current;
    if (!el) return;
    el.loop = true;
    const mark = () => setOn(!el.paused);
    const fail = () => setErr("Couldn't start. Use the play triangle on the bar under the stamp.");
    el.addEventListener("play", mark);
    el.addEventListener("pause", mark);
    el.addEventListener("playing", mark);
    el.addEventListener("ended", mark);
    el.addEventListener("error", fail);
    return () => {
      el.removeEventListener("play", mark);
      el.removeEventListener("pause", mark);
      el.removeEventListener("playing", mark);
      el.removeEventListener("ended", mark);
      el.removeEventListener("error", fail);
    };
  }, [src]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    setErr(null);
    if (el.paused) {
      void el.play().catch(() => {
        setErr("Tap the play triangle on the bar under the stamp.");
      });
    } else el.pause();
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
      <p className="mt-1 max-w-2xl text-sm text-muted">Audio on loop. Logo spins. Tap PLAY, then the stamp keeps turning.</p>
      <button
        type="button"
        onClick={toggle}
        className="relative mt-4 block w-full overflow-hidden rounded-sm bg-black text-left"
        aria-label={on ? "Pause loop" : "Play loop"}
      >
        <LogoStage label={on ? "On air · audio" : "Tap PLAY"} />
        {hasAudio ? (
          <div className="absolute left-3 top-3">
            <LiveDot />
          </div>
        ) : null}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-live px-6 py-2 font-display text-lg font-semibold uppercase tracking-[0.2em] text-live-fg">
          {on ? "Pause" : "Play"}
        </span>
      </button>
      {src ? (
        <>
          <audio
            ref={audioRef}
            className="mt-3 w-full"
            src={src}
            controls
            loop
            playsInline
            preload="auto"
          />
          <video
            className="sr-only"
            src={src}
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        </>
      ) : play?.kind === "mixcloud" ? (
        <iframe
          title={title}
          src={play.src}
          className="mt-3 h-16 w-full rounded-sm bg-black"
          allow="autoplay; encrypted-media"
        />
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing on the loop yet.</p>
      )}
      {err ? <p className="mt-2 text-sm text-live">{err}</p> : null}
      {canSet && user ? (
        <form onSubmit={(e) => void onSet(e)} className="mt-4 grid gap-2">
          <label className="text-sm text-muted">
            Loop URL
            <Input className="mt-1" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <Button type="submit" disabled={busy || !draft.trim()} className="w-fit uppercase">
            {busy ? "Saving…" : "Put on loop"}
          </Button>
        </form>
      ) : null}
    </section>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getStationLoop, setStationLoop } from "@/lib/loop-api";
import { DEFAULT_LOOP_TITLE, DEFAULT_LOOP_URL, parseLoopUrl } from "@/lib/factory-loop";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveDot } from "@/components/live-dot";
import { LogoStage } from "@/components/logo-stage";
import { DripEq } from "@/components/drip-eq";

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
    el.addEventListener("play", mark);
    el.addEventListener("pause", mark);
    el.addEventListener("playing", mark);
    el.addEventListener("ended", mark);
    return () => {
      el.removeEventListener("play", mark);
      el.removeEventListener("pause", mark);
      el.removeEventListener("playing", mark);
      el.removeEventListener("ended", mark);
    };
  }, [src]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    setErr(null);
    if (el.paused) void el.play().catch(() => setErr(null));
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
      setErr("Need Mixcloud, Dropbox, mp3/m4a or mp4. Sign in first.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        {hasAudio ? <LiveDot /> : null}
        <h2 className="min-w-0">
          <span className="sr-only">{title}</span>
          <img src="/art/brand/word-graff.png?v=graff1" alt="" className="h-8 w-auto sm:h-10" />
        </h2>
      </div>
      <p className="mt-2 max-w-2xl font-display text-sm font-semibold uppercase leading-relaxed tracking-wide text-muted">
        The last Filthfactory live recorded featuring regular guest DJs & takeovers — playing 24hrs a day.
      </p>
      <button
        type="button"
        onClick={toggle}
        className="relative mt-4 block w-full overflow-hidden rounded-sm bg-black text-left"
        aria-label={on ? "Pause loop" : "Play loop"}
      >
        <LogoStage label={on ? "On air" : "Play"} />
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
          <audio ref={audioRef} className="sr-only" src={src} loop playsInline preload="auto" />
          <DripEq />
        </>
      ) : play?.kind === "mixcloud" ? (
        <iframe
          title={title}
          src={play.src}
          className="mt-3 h-16 w-full rounded-sm bg-black"
          allow="autoplay; encrypted-media"
        />
      ) : null}
      {canSet && user ? (
        <form onSubmit={(e) => void onSet(e)} className="mt-4 grid gap-2">
          <label className="text-sm text-muted">
            Loop URL
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

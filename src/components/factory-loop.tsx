import { useEffect, useRef, useState, type FormEvent } from "react";
import { getStationLoop, setStationLoop } from "@/lib/loop-api";
import { parseLoopUrl } from "@/lib/factory-loop";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveDot } from "@/components/live-dot";
import { LogoStage } from "@/components/logo-stage";

export function FactoryLoop({ canSet = false }: { canSet?: boolean }) {
  const user = useCurrentUser();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Filthfactory 24/7");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const play = parseLoopUrl(url);
  const hasAudio = play?.kind === "audio" || play?.kind === "mixcloud";
  const blockedYt = play?.kind === "youtube";

  useEffect(() => {
    void getStationLoop()
      .then((row) => {
        setUrl(row.url);
        setTitle(row.title);
        setDraft(row.url);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || play?.kind !== "audio") return;
    el.loop = true;
    const mark = () => setOn(!el.paused);
    el.addEventListener("play", mark);
    el.addEventListener("pause", mark);
    return () => {
      el.removeEventListener("play", mark);
      el.removeEventListener("pause", mark);
    };
  }, [play?.kind, play?.src]);

  async function onSet(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const row = await setStationLoop({ data: { url: draft, title } });
      setUrl(row.url);
      setTitle(row.title);
    } catch {
      setErr("Need a Mixcloud or direct mp3/m4a HTTPS link. YouTube embeds are blocked. Sign in first.");
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
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Audio on loop. Logo spins. No YouTube window — they block the embed.
      </p>
      <div className="relative mt-4 overflow-hidden rounded-sm bg-black">
        <LogoStage label={on || play?.kind === "mixcloud" ? "On air · audio" : "24/7 loop"} />
        {hasAudio ? (
          <div className="absolute left-3 top-3">
            <LiveDot />
          </div>
        ) : null}
      </div>
      {play?.kind === "audio" ? (
        <audio ref={audioRef} className="mt-3 w-full" src={play.src} controls loop preload="none" />
      ) : play?.kind === "mixcloud" ? (
        <iframe
          title={title}
          src={play.src}
          className="mt-3 h-16 w-full rounded-sm bg-black"
          allow="autoplay; encrypted-media"
        />
      ) : blockedYt ? (
        <p className="mt-3 text-sm text-muted">
          YouTube blocked that video on other sites. Put the same set on{" "}
          <a className="underline" href="https://www.mixcloud.com/upload/" target="_blank" rel="noreferrer">
            Mixcloud
          </a>{" "}
          or a direct mp3/m4a link, then paste it below.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing on the loop yet. Mixcloud or mp3/m4a — not YouTube.</p>
      )}
      {canSet && user ? (
        <form onSubmit={(e) => void onSet(e)} className="mt-4 grid gap-2">
          <label className="text-sm text-muted">
            Loop URL (Mixcloud or mp3/m4a)
            <Input
              className="mt-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://www.mixcloud.com/you/your-six-hour-set/"
            />
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

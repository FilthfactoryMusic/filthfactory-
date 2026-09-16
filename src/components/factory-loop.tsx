import { useEffect, useState, type FormEvent } from "react";
import { getStationLoop, setStationLoop } from "@/lib/loop-api";
import { parseLoopUrl } from "@/lib/factory-loop";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FactoryLoop({ canSet = false }: { canSet?: boolean }) {
  const user = useCurrentUser();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Filthfactory 24/7");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const play = parseLoopUrl(url);

  useEffect(() => {
    void getStationLoop()
      .then((row) => {
        setUrl(row.url);
        setTitle(row.title);
        setDraft(row.url);
      })
      .catch(() => {});
  }, []);

  async function onSet(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const row = await setStationLoop({ data: { url: draft, title } });
      setUrl(row.url);
      setTitle(row.title);
    } catch {
      setErr("Need a YouTube, Mixcloud or direct mp3/m4a HTTPS link. Sign in first.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-live">24/7</p>
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        On loop until we change it. A six-hour set lives on YouTube (unlisted) or Mixcloud — we just play it here, over and over.
      </p>
      {play?.kind === "youtube" || play?.kind === "mixcloud" ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-sm bg-black">
          <iframe
            title={title}
            src={play.src}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : play?.kind === "audio" ? (
        <audio className="mt-4 w-full" src={play.src} controls loop preload="none" />
      ) : (
        <p className="mt-4 text-sm text-muted">Nothing on the loop yet. Upload the 6-hour set to YouTube unlisted, then paste the link below.</p>
      )}
      {canSet && user ? (
        <form onSubmit={(e) => void onSet(e)} className="mt-4 grid gap-2">
          <label className="text-sm text-muted">
            Loop URL (YouTube / Mixcloud / mp3)
            <Input
              className="mt-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
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

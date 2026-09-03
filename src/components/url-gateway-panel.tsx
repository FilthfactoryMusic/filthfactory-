import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GENRES } from "@/lib/catalog";
import { startUrlLive } from "@/lib/live-api";
import { parseLiveUrl } from "@/lib/live-url";
import { useLibrary } from "@/lib/library-store";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function UrlGatewayPanel() {
  const user = useCurrentUser();
  const setOwnLive = useLibrary((s) => s.setOwnLive);
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const parsed = parseLiveUrl(url);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!parsed) {
      setErr("YouTube, Mixcloud, Twitch or Kick HTTPS link only. No TikTok.");
      return;
    }
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const show = await startUrlLive({
        data: {
          title: title.trim() || `${parsed.label} desk`,
          genre: String(form.get("uggenre") ?? "UK Garage"),
          url: parsed.watchUrl,
          displayName: user?.displayName || user?.primaryEmail || "Resident",
          photo: user?.profileImageUrl,
          rightsConfirmed: form.get("urights") === "on",
        },
      });
      setOwnLive(show);
      void navigate({ to: "/live/$id", params: { id: show.id } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("URL_NOT_ALLOWED")) setErr("That URL isn't a desk we can host.");
      else if (msg.includes("RIGHTS")) setErr("Tick the rights box.");
      else if (msg.includes("MEMBERSHIP")) setErr("Resident membership required.");
      else setErr("Couldn't list that desk. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-8 rounded-sm border border-border bg-surface p-5">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Bring a live in</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Paste a YouTube, Mixcloud, Twitch or Kick URL. We embed their official player on Filthfactory so
        listeners stay in this room. We do not scrape TikTok. You must own or have the right to list that
        stream.
      </p>
      <label className="mt-4 block text-sm text-muted">
        Live URL
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1"
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </label>
      {parsed ? (
        <p className="mt-2 text-xs uppercase tracking-widest text-muted">
          {parsed.label} · ready to list
        </p>
      ) : null}
      <label className="mt-3 block text-sm text-muted">
        Show title
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" placeholder="Friday closedown" />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Genre
        <select
          name="uggenre"
          className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
        >
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 flex gap-3 text-sm leading-relaxed text-muted">
        <input type="checkbox" name="urights" className="mt-1 size-4 shrink-0 accent-accent" />
        <span>I have the right to list this stream on Filthfactory. It is mine or I have permission.</span>
      </label>
      <Button type="submit" variant="live" className="mt-5 h-12" disabled={busy || !parsed}>
        {busy ? "Listing…" : "List on Filthfactory"}
      </Button>
      {err ? <p className="mt-2 text-sm text-live">{err}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Already live on Mixcloud? List it here, then use{" "}
        <Link to="/booth" className="underline underline-offset-4">
          Also send to
        </Link>{" "}
        the other way if you host from this booth.
      </p>
    </form>
  );
}

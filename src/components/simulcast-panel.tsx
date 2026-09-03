import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  factoryLiveUrl,
  isHttpUrl,
  KNOWN_DESKS,
  loadSimulcast,
  openDesks,
  saveSimulcast,
  type SimulcastState,
} from "@/lib/simulcast";

export function SimulcastPanel({ liveId }: { liveId?: string | null }) {
  const [state, setState] = useState<SimulcastState>(() => loadSimulcast());
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState<number | null>(null);
  const room = liveId ? factoryLiveUrl(liveId) : null;
  const count = useMemo(() => {
    const n = KNOWN_DESKS.filter((d) => state.desks[d.id]).length + state.custom.length;
    return n;
  }, [state]);

  function commit(next: SimulcastState) {
    setState(next);
    saveSimulcast(next);
  }

  function addCustom() {
    const href = url.trim();
    if (!isHttpUrl(href)) return;
    const row = {
      id: `c-${Date.now()}`,
      label: label.trim() || new URL(href).hostname.replace(/^www\./, ""),
      url: href,
    };
    commit({ ...state, custom: [...state.custom, row] });
    setLabel("");
    setUrl("");
  }

  return (
    <section className="mt-8 rounded-sm border border-border bg-surface p-5">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Also send to</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        One camera, several desks. Tick Mixcloud, YouTube, Twitch or paste another live URL. We open those
        go-live pages together with this room. We do not push into someone else's RTMP — that's their ingest.
      </p>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {KNOWN_DESKS.map((d) => (
          <li key={d.id}>
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-sm border border-border px-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={Boolean(state.desks[d.id])}
                onChange={(e) =>
                  commit({ ...state, desks: { ...state.desks, [d.id]: e.target.checked } })
                }
              />
              <span className="font-medium">{d.name}</span>
            </label>
          </li>
        ))}
      </ul>

      {state.custom.length ? (
        <ul className="mt-3 space-y-2">
          {state.custom.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2 text-sm">
              <a href={c.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                {c.label}
              </a>
              <button
                type="button"
                className="text-xs text-muted hover:text-fg"
                onClick={() => commit({ ...state, custom: state.custom.filter((x) => x.id !== c.id) })}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://mixcloud.com/live/…"
        />
        <Button type="button" variant="outline" onClick={addCustom} disabled={!isHttpUrl(url.trim())}>
          Add URL
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="live"
          onClick={() => setOpened(openDesks(state))}
          disabled={count === 0}
        >
          Open {count || ""} desk{count === 1 ? "" : "s"}
        </Button>
        {room ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(room).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              });
            }}
          >
            {copied ? "Copied" : "Copy Filthfactory URL"}
          </Button>
        ) : null}
      </div>
      {opened != null ? (
        <p className="mt-3 text-xs text-muted">
          Opened {opened} tab{opened === 1 ? "" : "s"}. Allow pop-ups once. Paste the Filthfactory URL on Restream
          if you want one OBS feed to hit every site including us.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">
          OBS users: point Streamlabs / Restream at Mixcloud + YouTube, then paste this room as a custom
          destination so Filthfactory is in the same hit.
        </p>
      )}
    </section>
  );
}

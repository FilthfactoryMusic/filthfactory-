import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ObsDesk({ liveId }: { liveId?: string | null }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window === "undefined" ? "https://www.filthfactory.co.uk" : window.location.origin;
  const booth = `${origin}/booth`;
  const room = liveId ? `${origin}/live/${liveId}` : null;

  function copy(text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <section className="mt-8 rounded-sm border border-border bg-surface p-5">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">OBS / CDJ desk</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Filthfactory is a website, not an RTMP box — we cannot take a raw OBS stream the way Twitch does.
        This is the working path used by UK residents:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
        <li>Open OBS. Start <span className="text-fg">Virtual Camera</span>.</li>
        <li>
          On this page tap <span className="text-fg">Go live</span> and pick that camera + your mixer
          audio.
        </li>
        <li>Tick Mixcloud / YouTube under Also send to, or paste this room into Restream as a destination.</li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => copy(booth)}>
          {copied ? "Copied" : "Copy booth URL"}
        </Button>
        {room ? (
          <Button type="button" variant="outline" onClick={() => copy(room)}>
            Copy live room
          </Button>
        ) : null}
        <a
          href="https://restream.io/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
        >
          Restream
        </a>
      </div>
    </section>
  );
}

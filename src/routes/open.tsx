import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StealFlyer } from "@/components/steal-flyer";
import { CITIES } from "@/lib/catalog";
import { WORLD_LIVE } from "@/lib/feeds";
import { formatGbp } from "@/lib/utils";

export const Route = createFileRoute("/open")({
  component: OpenTheFactory,
  head: () => ({
    meta: [
      { title: "Open the factory — Filthfactory" },
      {
        name: "description",
        content:
          "Garage, grime, bassline, 140, DnB, tech house. Free to listen. £5/month to go live. Gifts 50/50. 18+.",
      },
    ],
  }),
});

const DM = `You're playing the rooms that never got a publicist. Filthfactory is the UK booth — live in one tap, Resident £5/month. Factory Friday 10pm. I'll Boost you for 90 days if you go live weekly. Come through.`;

const CAPTIONS = [
  "Garage. Grime. Bassline. 140. DnB. Tech house. That's the room.",
  "Not a playlist. A booth.",
  "Gift the DJ. They keep half. We keep the lights on.",
  "Kitchen, cellar, warehouse. We don't care. GO LIVE.",
  "Put ya cans on. Turn it up.",
];

function nextFridayTen() {
  const now = new Date();
  const d = new Date(now);
  const add = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (add === 0 && d.getHours() >= 22 ? 7 : add));
  d.setHours(22, 0, 0, 0);
  return d;
}

function OpenTheFactory() {
  const [left, setLeft] = useState("");
  const ident = useRef<HTMLAudioElement>(null);
  const live = WORLD_LIVE[0];

  useEffect(() => {
    const tick = () => {
      const ms = nextFridayTen().getTime() - Date.now();
      if (ms <= 0) {
        setLeft("LIVE NOW");
        return;
      }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function copy(text: string, ok: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    toast(ok);
  }

  return (
    <div className="enter-up">
      <section className="relative overflow-hidden rounded-lg border border-border bg-surface">
        <video
          className="aspect-[9/16] w-full object-cover md:aspect-[21/9] md:max-h-[520px]"
          src="/campaign/ad-warehouse.mp4"
          poster="/campaign/01-open-the-factory.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/20" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-10">
          <p className="text-xs uppercase tracking-widest text-live-fg">Factory Friday · 10pm UK · 18+</p>
          <h1 className="mt-2 font-display text-4xl font-semibold uppercase leading-none tracking-wide md:text-6xl">
            Open the factory
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Mixes and live from the rooms that never got a publicist. Listening is free. Resident {formatGbp(500)}{" "}
            / month. Gifts not on sale yet.
          </p>
          <p className="mt-2 font-display text-2xl uppercase tracking-wide text-fg">{left || "…"}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/booth"
              className="inline-flex h-11 items-center rounded-sm bg-live px-5 text-sm font-medium text-live-fg"
            >
              Go live
            </Link>
            <Link
              to="/live"
              className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-sm font-medium text-accent-fg"
            >
              Listen
            </Link>
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm"
              onClick={() => void ident.current?.play()}
            >
              Play ident
            </button>
            <StealFlyer
              title={"OPEN THE\nFACTORY"}
              kicker="FILTHFACTORY"
              sub="UK underground. Live. No playlists."
              artwork="/campaign/01-open-the-factory.jpg"
              live
              href="/open"
            />
          </div>
        </div>
      </section>
      <audio ref={ident} src="/campaign/ident-open.mp3" preload="none" />

      <section className="mt-6 rounded-lg border border-border bg-raised p-4 text-sm md:flex md:items-center md:justify-between">
        <p>
          <span className="font-medium">Tonight:</span> TikTok is the 6s clip labelled The tap.
          Save video → camera roll → TikTok upload.
        </p>
        <a
          href="/campaign/ad-go-live.mp4"
          download="filthfactory-go-live.mp4"
          className="mt-3 inline-flex h-11 items-center rounded-sm bg-live px-5 text-sm font-medium text-live-fg md:mt-0"
        >
          Download TikTok clip
        </a>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { src: "/campaign/ad-warehouse.mp4", cap: "The room" },
          { src: "/campaign/ad-go-live.mp4", cap: "The tap" },
          { src: "/campaign/ad-stamp.mp4", cap: "The door" },
        ].map((v) => (
          <figure key={v.src} className="overflow-hidden rounded-lg border border-border bg-surface">
            <video src={v.src} className="aspect-[9/16] w-full object-cover md:aspect-video" controls playsInline preload="metadata" />
            <figcaption className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-widest text-muted">
              <span>{v.cap}</span>
              <a href={v.src} download className="text-fg hover:text-accent">
                Download
              </a>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">Steal the captions</h2>
          <p className="mt-2 text-sm text-muted">Post them as-is. If you rewrite them posh, you've lost.</p>
          <ul className="mt-4 space-y-2">
            {CAPTIONS.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => void copy(c, "Caption copied")}
                  className="w-full rounded-md border border-border px-3 py-3 text-left text-sm hover:border-accent"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">DM a DJ tonight</h2>
          <p className="mt-2 text-sm text-muted">
            Thirty captains. One message. Boost for 90 days if they go live weekly.
          </p>
          <pre className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-raised p-4 text-sm text-fg">
            {DM}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="h-11 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg"
              onClick={() => void copy(DM, "DM copied")}
            >
              Copy the DM
            </button>
            <button
              type="button"
              className="h-11 rounded-md border border-border px-5 text-sm"
              onClick={() => {
                const a = new Audio("/campaign/ident-dj.mp3");
                void a.play();
              }}
            >
              Play DJ ident
            </button>
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted">Cities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                to="/city/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border px-3 py-1 text-xs hover:border-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {live ? (
        <section className="mt-12 overflow-hidden rounded-lg border border-border bg-surface md:grid md:grid-cols-2">
          <img src={live.artwork} alt="" className="aspect-video w-full bg-bg object-contain" />
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-live">On the floor now</p>
            <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-wide">{live.title}</h2>
            <p className="mt-2 text-sm text-muted">
              {live.city} · {live.venue}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/live/$id"
                params={{ id: live.id }}
                className="inline-flex h-11 items-center rounded-sm bg-live px-5 text-sm font-medium text-live-fg"
              >
                Tune in
              </Link>
              <StealFlyer
                title={live.title}
                kicker={live.city}
                sub={`${live.venue} · Filthfactory`}
                artwork={live.artwork}
                live
              />
            </div>
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-xs text-faint">
        18+ only. Paid ads must show the real price in GBP. Do not put unlicensed chart records in the films. Report
        tools are on every live.
      </p>
    </div>
  );
}

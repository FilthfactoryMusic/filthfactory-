import { createFileRoute } from "@tanstack/react-router";
import { BrandedText } from "@/components/brand-mark";
import { FaceMarquee } from "@/components/face-marquee";
import { LabelReel } from "@/components/label-reel";
import { WOW_GENRES } from "@/lib/wow-scan";
import { useWow } from "@/lib/use-wow";

export const Route = createFileRoute("/wow")({
  component: WowPage,
  head: () => ({
    meta: [
      { title: "Who's On What — Filthfactory" },
      {
        name: "description",
        content:
          "Who's on what — UK garage, grime, bassline, 140, drum & bass, tech house, trance, hard house. Real DJs and MCs. Last 90 days.",
      },
    ],
  }),
});

function WowPage() {
  const { digest, loading } = useWow();
  const items = digest?.items ?? [];
  const faces = items.filter((i) => i.kind === "artist" && i.thumb);
  const news = items.filter((i) => i.kind === "news" || i.kind === "mix");

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-live">WOW</p>
      <h1 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">Who's on what</h1>
      <p className="mt-2 max-w-xl font-display text-sm font-semibold uppercase tracking-wide text-muted">
        UK DJs and MCs — garage, grime, bassline, 140, DnB, tech house, trance, hard house. Keep up with your favourite UK underground artists in one place.
      </p>

      {loading ? <p className="mt-10 text-sm text-muted">Pulling the last 90 days…</p> : null}

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">On the desk</h2>
      <div className="mt-4">
        <FaceMarquee faces={faces} />
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold uppercase tracking-wide">UK bass labels</h2>
      <div className="mt-4">
        <LabelReel />
      </div>

      {WOW_GENRES.map((g) => {
        const rows = news.filter((i) => i.genre === g.name);
        if (!rows.length) return null;
        return (
          <section key={g.id} className="mt-10">
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">{g.name}</h2>
            <ul className="mt-3 space-y-2">
              {rows.slice(0, 6).map((n) => (
                <li key={n.id}>
                  <a href={n.url} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                    <BrandedText text={n.title} />
                  </a>
                  <p className="text-xs text-muted">
                    <BrandedText text={n.blurb} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

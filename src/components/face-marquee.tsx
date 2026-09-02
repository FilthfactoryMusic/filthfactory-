import type { WowItem } from "@/lib/wow-scan";

export function FaceMarquee({ faces }: { faces: WowItem[] }) {
  if (!faces.length) return null;
  const row = faces.length < 8 ? [...faces, ...faces, ...faces] : [...faces, ...faces];
  return (
    <div className="overflow-hidden">
      <div className="wow-marquee flex w-max gap-5 pr-5">
        {row.map((it, i) => (
          <a
            key={`${it.id}-${i}`}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="w-28 shrink-0 text-center sm:w-32"
          >
            <img
              src={it.thumb || "/art/brand/logo.png"}
              alt=""
              className="aspect-square w-full rounded-full object-cover"
            />
            <p className="mt-2 truncate text-xs font-medium sm:text-sm">{it.title}</p>
            <p className="truncate text-[10px] uppercase tracking-widest text-muted">{it.genre}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

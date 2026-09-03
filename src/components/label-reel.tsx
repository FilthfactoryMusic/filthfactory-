import { UK_BASS_LABELS } from "@/lib/uk-bass-labels";

export function LabelReel() {
  const items = UK_BASS_LABELS;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className="wow-marquee flex w-max items-end gap-5 pr-5">
        {row.map((lab, i) => (
          <a
            key={`${lab.name}-${i}`}
            href={lab.site}
            target="_blank"
            rel="noreferrer"
            className="w-24 shrink-0 text-center sm:w-28"
          >
            <img
              src={lab.logo}
              alt={lab.name}
              className="aspect-square w-full rounded-sm bg-black object-contain"
            />
            <p className="mt-2 truncate text-[11px] font-medium sm:text-xs">{lab.name}</p>
            <p className="truncate text-[9px] uppercase tracking-widest text-muted">{lab.genre}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

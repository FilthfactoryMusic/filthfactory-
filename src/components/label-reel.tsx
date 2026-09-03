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
            className="w-28 shrink-0 text-center sm:w-32"
          >
            <img
              src={lab.logo}
              alt={lab.name}
              width={128}
              height={128}
              loading={i < 8 ? "eager" : "lazy"}
              decoding="async"
              className="aspect-square w-full rounded-sm bg-black object-contain"
            />
            <p className="mt-2 truncate font-display text-[11px] font-semibold uppercase tracking-wide sm:text-xs">{lab.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

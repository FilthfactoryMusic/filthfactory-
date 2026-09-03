import { WOW_LABELS } from "@/lib/wow-scan";

export function LabelReel() {
  const items = WOW_LABELS.filter((l) => l.logo);
  if (!items.length) return null;
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className="wow-marquee flex w-max items-end gap-6 pr-6">
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
              className="aspect-square w-full rounded-sm bg-[#f4f4f0] object-contain p-2"
            />
            <p className="mt-2 truncate text-xs font-medium sm:text-sm">{lab.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

import { findBrand, splitBrands, type Brand } from "@/lib/brands";
import { cn } from "@/lib/utils";

export function BrandMark({
  name,
  size = "sm",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const brand = findBrand(name);
  if (!brand) return <span className={className}>{name}</span>;
  return <BrandChip brand={brand} label={name} size={size} className={className} />;
}

export function BrandChip({
  brand,
  label,
  size = "sm",
  className,
}: {
  brand: Brand;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "size-8" : size === "md" ? "size-6" : "size-4";
  const round = brand.name === "Filthfactory" ? "rounded-full" : "rounded-sm";
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 align-middle", className)}>
      <img src={brand.logo} alt="" className={cn(box, round, "shrink-0 bg-black object-contain")} />
      <span className="truncate">{label ?? brand.name}</span>
    </span>
  );
}

/** Swap any known label / desk / Filthfactory mention for logo + name. */
export function BrandedText({ text, className }: { text: string; className?: string }) {
  const parts = splitBrands(text);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.brand ? <BrandChip key={`${p.brand.name}-${i}`} brand={p.brand} label={p.text} /> : <span key={i}>{p.text}</span>,
      )}
    </span>
  );
}

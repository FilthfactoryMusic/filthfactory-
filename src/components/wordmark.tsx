import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/art/brand/logo.png?v=chrome3"
        alt=""
        className="size-16 rounded-full object-contain sm:size-20 md:size-[5.5rem]"
      />
      <span className="ff-word font-display text-xl font-bold uppercase tracking-[0.14em] sm:text-2xl md:text-4xl md:tracking-[0.18em]">
        Filthfactory
      </span>
    </span>
  );
}

import { cn } from "@/lib/utils";

/** Header stamp only. Hero CDJ mark stays large in stamp-cdj. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/art/brand/logo.png?v=chrome3"
        alt=""
        className="size-12 shrink-0 rounded-full object-contain sm:size-14 md:size-14"
      />
      <span className="flex flex-col items-start leading-none">
        <img
          src="/art/brand/word-graff.png?v=graff1"
          alt="Filthfactory"
          className="h-7 w-auto sm:h-8 md:h-9"
        />
        <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-muted sm:text-[10px]">
          filthfactory.co.uk
        </span>
      </span>
    </span>
  );
}

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
      <img
        src="/art/brand/word-graff.png?v=graff1"
        alt="Filthfactory"
        className="h-8 w-auto sm:h-9 md:h-10"
      />
    </span>
  );
}

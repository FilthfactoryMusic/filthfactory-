import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img src="/art/brand/logo.png" alt="Filthfactory" className="h-12 w-12 rounded-full object-cover md:h-14 md:w-14" />
    </span>
  );
}

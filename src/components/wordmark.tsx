import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img src="/art/brand/logo.png" alt="Filthfactory" className="h-10 w-10 rounded-full object-cover md:h-11 md:w-11" />
    </span>
  );
}

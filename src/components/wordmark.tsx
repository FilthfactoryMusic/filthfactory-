import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img src="/art/brand/logo.png" alt="Filthfactory" className="size-20 rounded-full object-cover md:size-[5.5rem]" />
    </span>
  );
}

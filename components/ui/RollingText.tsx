import { cn } from "@/lib/utils";

/**
 * On hover or keyboard focus of the closest `.group` parent, the label rolls up
 * and an identical copy rolls in from below.
 */
export function RollingText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span className="block transition-transform duration-500 ease-quart group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 block translate-y-full transition-transform duration-500 ease-quart group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

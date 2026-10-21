import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FoldProps {
  summary: ReactNode;
  summaryClassName?: string;
  className?: string;
  id?: string;
  children: ReactNode;
}

/**
 * A disclosure that stays a toggle at every width (unlike PhoneFold, which
 * opens itself from md up): for detail that sits under a visual summary
 * on desktops too. Served closed; the content stays in the HTML for
 * search and find-in-page, and AnchorSettle opens it when a link points
 * inside.
 */
export function Fold({
  summary,
  summaryClassName,
  className,
  id,
  children,
}: FoldProps) {
  return (
    <details id={id} className={cn("group/fold", className)}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        {summary}
        <span
          aria-hidden="true"
          className="text-2xl leading-none font-light text-ink-soft transition-[rotate] duration-300 group-open/fold:rotate-45"
        >
          +
        </span>
      </summary>
      {children}
    </details>
  );
}

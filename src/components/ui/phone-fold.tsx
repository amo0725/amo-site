import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PhoneFoldProps {
  /** Always-visible line: a toggle on phones, a plain heading from md up. */
  summary: ReactNode;
  summaryClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Progressive disclosure for phones, with no JavaScript. Served closed:
 * on a phone the reader sees one line per item with the detail a tap away.
 * From md up CSS shows the content anyway and the summary reads as a
 * heading (see .phone-fold in globals.css), so desktops lay out as before.
 * The content stays in the HTML either way, for search and find-in-page.
 */
export function PhoneFold({
  summary,
  summaryClassName,
  className,
  children,
}: PhoneFoldProps) {
  return (
    <details className={cn("phone-fold", className)}>
      <summary className={summaryClassName}>
        {summary}
        <span
          aria-hidden="true"
          className="fold-icon text-2xl leading-none font-light text-ink-soft"
        >
          +
        </span>
      </summary>
      {children}
    </details>
  );
}

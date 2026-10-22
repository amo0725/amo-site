import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PhoneFoldProps {
  /** The toggle on phones. */
  summary: ReactNode;
  summaryClassName?: string;
  /**
   * What stands in for the toggle from md up, where the content is always
   * shown and a toggle would be a control that does nothing: a plain label
   * or heading. Leave it out when nothing should stand there.
   */
  wide?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Progressive disclosure for phones, with no JavaScript. Served closed:
 * on a phone the reader sees one line per item with the detail a tap away.
 * From md up CSS shows the content anyway and swaps the toggle for the
 * `wide` label (see .phone-fold in globals.css), so desktops lay out as
 * before and keyboard users meet no inert toggles. The content stays in
 * the HTML either way, for search and find-in-page.
 */
export function PhoneFold({
  summary,
  summaryClassName,
  wide,
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
      {wide ? <div className="fold-wide">{wide}</div> : null}
      {children}
    </details>
  );
}

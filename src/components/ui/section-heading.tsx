import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  /** CSS custom property for the section's band colour, e.g. "--band-2". */
  colorVar: string;
  children: ReactNode;
  lead?: ReactNode;
  /** Text for sections drawn on the end panel (--closing). */
  inverted?: boolean;
  /** Narrow column (a sticky side heading): no rule. */
  compact?: boolean;
  className?: string;
}

/**
 * Section title as a chart title: the swatch (matching the section's band
 * in the side legend), the title, and from md up a rule to the edge.
 * Swatch and rule sweep in like a radar scan as the title arrives (pure
 * CSS, .scan-swatch / .scan-rule); the text itself is always shown. No
 * section number: nothing refers to sections by number.
 */
export function SectionHeading({
  id,
  colorVar,
  children,
  lead,
  inverted = false,
  compact = false,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("mb-8 md:mb-14", className)}>
      <h2
        id={`${id}-title`}
        className="flex items-center gap-4 text-2xl font-bold tracking-tight font-expanded md:text-3xl"
      >
        <span
          aria-hidden="true"
          className="scan-swatch inline-block size-3 shrink-0 md:size-3.5"
          style={{ background: `var(${colorVar})` }}
        />
        <span>{children}</span>
        {!compact ? (
          <span
            aria-hidden="true"
            className={cn(
              "scan-rule ml-2 hidden h-px flex-1 md:block",
              inverted ? "bg-on-closing/25" : "bg-graticule",
            )}
          />
        ) : null}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-[40rem]",
            inverted ? "text-on-closing/75" : "text-ink-soft",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}

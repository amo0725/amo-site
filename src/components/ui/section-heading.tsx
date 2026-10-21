import type { ReactNode } from "react";
import { sections } from "@/config/site";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  /** CSS custom property for the section's band colour, e.g. "--band-2". */
  colorVar: string;
  children: ReactNode;
  lead?: ReactNode;
  /** Text for sections drawn on the end panel (--closing). */
  inverted?: boolean;
  /** Narrow column (a sticky side heading): no rule or index. */
  compact?: boolean;
  className?: string;
}

/**
 * Section title as a chart title: the swatch (matching the section's band
 * in the side legend), the title, and from md up a rule to the edge with
 * the section's index. Swatch and rule sweep in like a radar scan as the
 * title arrives (pure CSS, .scan-swatch / .scan-rule); the text itself is
 * always shown.
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
  const n = sections.findIndex((s) => s.id === id);
  const index = n >= 0 ? String(n + 1).padStart(2, "0") : null;
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
          <>
            <span
              aria-hidden="true"
              className={cn(
                "scan-rule ml-2 hidden h-px flex-1 md:block",
                inverted ? "bg-on-closing/25" : "bg-graticule",
              )}
            />
            {index ? (
              <span
                aria-hidden="true"
                className={cn(
                  "coord hidden md:inline",
                  inverted && "text-on-closing/70",
                )}
              >
                {index}
              </span>
            ) : null}
          </>
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

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id: string;
  /** CSS custom property for the section's band colour, e.g. "--band-2". */
  colorVar: string;
  children: ReactNode;
  lead?: ReactNode;
  /** Light text for sections drawn on the ink panel. */
  inverted?: boolean;
  className?: string;
}

/**
 * Section title. The swatch matches the section's band in the side legend,
 * so the colour tells readers where they are. On scroll it is swept in like
 * a radar scan (pure CSS, see .scan-text / .scan-swatch).
 */
export function SectionHeading({
  id,
  colorVar,
  children,
  lead,
  inverted = false,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("mb-8 max-w-[40rem] md:mb-14", className)}>
      <h2
        id={`${id}-title`}
        className="flex items-center gap-4 text-2xl font-bold tracking-tight font-expanded md:text-3xl"
      >
        <span
          aria-hidden="true"
          className="scan-swatch inline-block size-3 shrink-0 md:size-3.5"
          style={{ background: `var(${colorVar})` }}
        />
        <span className="scan-text">{children}</span>
      </h2>
      {lead ? (
        <p className={cn("mt-4", inverted ? "text-paper/75" : "text-ink-soft")}>
          {lead}
        </p>
      ) : null}
    </header>
  );
}

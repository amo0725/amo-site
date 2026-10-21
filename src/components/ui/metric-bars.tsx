import type { CSSProperties } from "react";
import type { Metric } from "@/content/types";
import { cn } from "@/lib/cn";
import { EchoCells } from "./echo-cells";

/** Cells in one echo bar. Lengths are linear from zero, at cell precision. */
const CELLS = 48;

/**
 * Before → after measurements as a radar echo. The bar is a row of echo
 * cells, linear from zero. When it plays (the work-log entry opens, or the
 * bar scrolls into view), the full "before" length lights up red from the
 * left, then a cooling wave runs back from the right through the echo
 * scale and the cells beyond the "after" length fade to the track; what is
 * left turns green. The old figure gets struck through and the new one is
 * wiped in, the same vocabulary as the showreel's root-cause scene.
 *
 * At rest (and with motion off) it shows the end state: a faint track at
 * the "before" length with the green "after" cells at its start. The text
 * is the accessible content; the cells are decoration.
 */
export function MetricBars({
  metrics,
  className,
}: {
  metrics: readonly Metric[];
  className?: string;
}) {
  return (
    <dl className={cn("space-y-5", className)}>
      {metrics.map((m) => {
        // An "after" of zero clears the whole bar; anything else keeps at
        // least one cell so a tiny result is still visible.
        const keep =
          m.after <= 0
            ? 0
            : Math.max(
                1,
                Math.min(CELLS, Math.round((m.after / m.before) * CELLS)),
              );
        return (
          <div
            key={m.label}
            className="metric grid gap-1.5 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-4"
            style={{ "--keep": keep, "--cells": CELLS } as CSSProperties}
          >
            <dt className="text-sm text-ink-soft">{m.label}</dt>
            <dd>
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold tabular">
                <span className="metric-before relative text-ink-soft">
                  {m.beforeText}
                </span>
                <span aria-hidden="true" className="text-ink-soft">
                  →
                </span>
                <span className="metric-new">{m.afterText}</span>
                {m.factor ? (
                  <span className="metric-factor font-normal text-ink-soft">
                    {m.factor}
                  </span>
                ) : null}
              </p>
              <EchoCells cells={CELLS} keep={keep} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

import type { CSSProperties } from "react";
import type { Metric } from "@/content/types";

/** Cells in a row's strip: half the detail bar's 48, same instrument. */
const CELLS = 24;

/**
 * A measurement on a collapsed row, drawn as the same echo strip as the
 * full metric bars: 24 cells for the "before", the green ones what is left
 * "after", to scale from zero. A tiny result keeps one cell; a result of
 * zero clears them all. The figures beside it carry the meaning.
 */
export function MiniBar({ metric }: { metric: Metric }) {
  const keep =
    metric.after <= 0
      ? 0
      : Math.max(
          1,
          Math.min(CELLS, Math.round((metric.after / metric.before) * CELLS)),
        );
  return (
    <span className="mini-bar grid w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 text-sm tabular">
      <span className="text-ink-soft">{metric.beforeText}</span>
      <span
        aria-hidden="true"
        className="echo-track block h-2"
        style={{ "--cells": CELLS, "--keep": keep } as CSSProperties}
      />
      <span className="flex items-baseline gap-1.5 font-semibold">
        {metric.afterText}
        {metric.factor ? (
          <span className="text-xs font-bold text-echo-2-ink">
            {metric.factor}
          </span>
        ) : null}
      </span>
    </span>
  );
}

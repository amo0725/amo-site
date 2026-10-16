"use client";

import { m } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/i18n";
import { valueNoise } from "@/lib/noise";
import type { UiStrings } from "@/content/types";

type Ratio = "2:1" | "1:1";

const SAMPLES = 72;
const W = 360;
const H = 120;

/** Illustrative frame times (ms). Same number of points in both, so the path can morph. */
function series(ratio: Ratio): number[] {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const jitter = (valueNoise(i * 0.9, ratio === "2:1" ? 3 : 9) - 0.5) * 0.9;
    const spike =
      ratio === "2:1" && (i % 11 === 4 || i % 17 === 9) ? 6 + (i % 5) : 0;
    return 4.2 + jitter + spike;
  });
}

function toPath(values: number[]): string {
  const max = 14;
  return values
    .map((v, i) => {
      const x = (i / (SAMPLES - 1)) * W;
      const y = H - (Math.min(v, max) / max) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const PATHS: Record<Ratio, string> = {
  "2:1": toPath(series("2:1")),
  "1:1": toPath(series("1:1")),
};

export function FrametimeChart({ ui }: { ui: UiStrings["offDuty"] }) {
  const [ratio, setRatio] = useState<Ratio>("2:1");

  return (
    <figure>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm text-ink-soft">UCLK : MEMCLK</span>
        <div
          role="group"
          aria-label={ui.ratioLabel}
          className="flex gap-1 rounded-full border border-control p-1"
        >
          {(["2:1", "1:1"] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={ratio === r}
              onClick={() => setRatio(r)}
              className={cn(
                "min-h-10 rounded-full px-3.5 text-sm tabular transition-colors",
                ratio === r
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-28 w-full overflow-visible"
        role="img"
        aria-label={fill(ui.chartLabel, { ratio })}
      >
        <line
          x1="0"
          x2={W}
          y1={H - (6.9 / 14) * H}
          y2={H - (6.9 / 14) * H}
          stroke="var(--graticule)"
          strokeDasharray="3 4"
        />
        <m.path
          d={PATHS[ratio]}
          animate={{ d: PATHS[ratio] }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          fill="none"
          stroke={ratio === "2:1" ? "var(--echo-5)" : "var(--echo-2)"}
          strokeWidth="1.75"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-2 text-sm text-ink-soft">
        {ratio === "2:1" ? ui.chart21 : ui.chart11}
      </figcaption>
    </figure>
  );
}

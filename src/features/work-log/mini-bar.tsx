import type { Metric } from "@/content/types";

/**
 * A measurement as two lengths on one line, for a collapsed row: the
 * track is the "before", the green bar the "after", to scale from zero
 * (a tiny result keeps a sliver so it is still visible). The figures
 * beside it carry the meaning; the bar only makes the size of the change
 * visible at a glance.
 */
export function MiniBar({ metric }: { metric: Metric }) {
  const ratio =
    metric.before > 0 ? Math.max(0, metric.after / metric.before) : 0;
  return (
    <span className="mini-bar grid w-full max-w-[26rem] grid-cols-[auto_1fr_auto] items-center gap-2 text-sm tabular">
      <span className="text-ink-soft">{metric.beforeText}</span>
      <span aria-hidden="true" className="relative h-1.5 bg-ink/15">
        <span
          className="mini-bar-after absolute inset-y-0 left-0 min-w-0.5 bg-echo-2"
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </span>
      <span className="font-semibold text-ink">
        {metric.afterText}
        {metric.factor ? (
          <span className="ml-1.5 font-normal text-ink-soft">
            {metric.factor}
          </span>
        ) : null}
      </span>
    </span>
  );
}

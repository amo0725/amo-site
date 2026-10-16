"use client";

import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { useState } from "react";
import type { UiStrings, WorkCategory, WorkEntry } from "@/content/types";
import { InView } from "@/components/motion/in-view";
import { MetricBars, metricHeadline } from "@/components/ui/metric-bars";
import { cn } from "@/lib/cn";
import { CaseFlows } from "./case-flows";
import { useMotionPreference } from "@/lib/motion/preference";

export interface TrackOption {
  id: string;
  label: string;
}

interface WorkLogProps {
  entries: readonly WorkEntry[];
  tracks: readonly TrackOption[];
  categories: Readonly<Record<WorkCategory, string>>;
  colors: Readonly<Record<WorkCategory, string>>;
  ui: UiStrings["work"];
}

const ALL = "__all__";
const ease = [0.16, 1, 0.3, 1] as const;
const easeInOutQuart = [0.76, 0, 0.24, 1] as const;
/* Rows are wiped in and out, never faded: in from the left edge, out by the
   same edge moving right. All insets are percentages so Motion can
   interpolate them; the small negative insets at rest leave room for the
   summary's focus ring and glyph overhang. */
const CLIP_BEFORE = "inset(-20% 102% -20% -2%)";
const CLIP_SHOWN = "inset(-20% -2% -20% -2%)";
const CLIP_AFTER = "inset(-20% -2% -20% 102%)";

interface FilterOption {
  value: string;
  label: string;
  count: number;
  colorVar?: string;
}

function FilterGroup({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative isolate flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
              on ? "border-ink text-paper" : "border-coast hover:border-ink",
            )}
          >
            {on ? (
              <m.span
                layoutId={`pill-${id}`}
                className="absolute inset-0 -z-10 rounded-full bg-ink"
                transition={{ duration: 0.35, ease }}
              />
            ) : null}
            {opt.colorVar ? (
              <span
                aria-hidden="true"
                className="size-2"
                style={{ background: `var(${opt.colorVar})` }}
              />
            ) : null}
            <span>{opt.label}</span>
            <span
              className={cn("tabular", on ? "text-paper/70" : "text-ink-soft")}
            >
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function count<T extends string>(
  entries: readonly WorkEntry[],
  key: (e: WorkEntry) => T,
) {
  const map = new Map<T, number>();
  for (const e of entries) map.set(key(e), (map.get(key(e)) ?? 0) + 1);
  return map;
}

export function WorkLog({
  entries,
  tracks,
  categories,
  colors,
  ui,
}: WorkLogProps) {
  const [type, setType] = useState<string>(ALL);
  const [track, setTrack] = useState<string>(ALL);
  // Motion's reducedMotion setting only drops transforms and layout, so the
  // clip-path wipes are switched off here.
  const reduced = useMotionPreference() === "reduced";

  const visible = entries.filter(
    (e) =>
      (type === ALL || e.category === type) &&
      (track === ALL || e.track === track),
  );

  const typeCounts = count(entries, (e) => e.category);
  const trackCounts = count(entries, (e) => e.track);
  const trackLabel = new Map(tracks.map((t) => [t.id, t.label]));

  const typeOptions: FilterOption[] = [
    { value: ALL, label: ui.all, count: entries.length },
    ...(Object.keys(categories) as WorkCategory[])
      .filter((k) => typeCounts.has(k))
      .map((k) => ({
        value: k,
        label: categories[k],
        colorVar: colors[k],
        count: typeCounts.get(k) ?? 0,
      })),
  ];
  const trackOptions: FilterOption[] = [
    { value: ALL, label: ui.all, count: entries.length },
    ...tracks
      .filter((t) => trackCounts.has(t.id))
      .map((t) => ({
        value: t.id,
        label: t.label,
        count: trackCounts.get(t.id) ?? 0,
      })),
  ];

  return (
    <LayoutGroup>
      <div className="mb-8 space-y-3">
        <FilterGroup
          id="type"
          label={ui.byType}
          options={typeOptions}
          value={type}
          onChange={setType}
        />
        <FilterGroup
          id="track"
          label={ui.byTrack}
          options={trackOptions}
          value={track}
          onChange={setTrack}
        />
      </div>

      <m.ul layout className="border-t border-graticule">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((entry) => (
            <m.li
              key={entry.id}
              layout
              initial={{ clipPath: CLIP_BEFORE }}
              animate={{ clipPath: CLIP_SHOWN }}
              exit={{
                clipPath: CLIP_AFTER,
                transition: reduced
                  ? { duration: 0 }
                  : { duration: 0.25, ease: easeInOutQuart },
              }}
              transition={reduced ? { duration: 0 } : { duration: 0.35, ease }}
              className="border-b border-graticule"
            >
              {/* Featured cases start open; their figures play when scrolled
                  into view instead of on page load (see data-featured in CSS). */}
              <details
                className="log-entry group"
                open={entry.featured}
                data-featured={entry.featured ? "" : undefined}
              >
                <summary className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 py-5 md:grid-cols-[7rem_1fr_auto] md:gap-x-8 md:py-6">
                  <span className="flex items-center gap-2 text-sm text-ink-soft">
                    <span
                      aria-hidden="true"
                      className="inline-block size-2.5"
                      style={{ background: `var(${colors[entry.category]})` }}
                    />
                    {categories[entry.category]}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold md:text-xl">
                      {entry.title}
                    </span>
                    <span className="flex flex-wrap gap-x-3 text-sm text-ink-soft">
                      <span>{trackLabel.get(entry.track)}</span>
                      {entry.metrics?.[0] ? (
                        <span className="metric-headline font-semibold text-ink tabular">
                          {metricHeadline(entry.metrics[0])}
                        </span>
                      ) : entry.outcome ? (
                        <span className="metric-headline font-semibold text-ink">
                          {entry.outcome}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="log-chevron text-2xl leading-none font-light text-ink-soft"
                  >
                    +
                  </span>
                </summary>
                <div className="grid gap-6 pb-8 md:grid-cols-[7rem_1fr] md:gap-x-8">
                  <div className="max-w-[44rem] space-y-5 md:col-start-2">
                    <p className="text-lg">{entry.problem}</p>
                    {entry.cause ? (
                      <div>
                        <h4 className="text-sm font-semibold text-ink-soft">
                          {ui.cause}
                        </h4>
                        <p className="mt-1">{entry.cause}</p>
                      </div>
                    ) : null}
                    <div>
                      <h4 className="text-sm font-semibold text-ink-soft">
                        {ui.actions}
                      </h4>
                      <ul className="mt-1 space-y-1.5">
                        {entry.actions.map((action) => (
                          <li key={action} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-[0.8em] h-px w-3 shrink-0 bg-ink"
                            />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {entry.flows ? <CaseFlows flows={entry.flows} /> : null}
                    {entry.result || entry.metrics || entry.evidence ? (
                      <div>
                        <h4 className="text-sm font-semibold text-ink-soft">
                          {ui.result}
                        </h4>
                        {entry.metrics ? (
                          entry.featured ? (
                            <InView className="metric-play mt-3 mb-4">
                              <MetricBars metrics={entry.metrics} />
                            </InView>
                          ) : (
                            <MetricBars
                              metrics={entry.metrics}
                              className="metric-play mt-3 mb-4"
                            />
                          )
                        ) : null}
                        {entry.result ? (
                          <p className="mt-1">{entry.result}</p>
                        ) : null}
                        {entry.evidence ? (
                          <InView threshold={0.4}>
                            <ul className="mt-3 space-y-1.5 tabular">
                              {entry.evidence.map((line, i) => (
                                <li
                                  key={line}
                                  className="evidence flex gap-3"
                                  style={{ "--i": i } as React.CSSProperties}
                                >
                                  <svg
                                    aria-hidden="true"
                                    viewBox="0 0 16 16"
                                    className="mt-[0.2em] size-4 shrink-0 text-echo-2"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <rect
                                      className="evidence-box"
                                      x="1.5"
                                      y="1.5"
                                      width="13"
                                      height="13"
                                      pathLength={1}
                                      strokeWidth="1.5"
                                    />
                                    <path
                                      className="evidence-check"
                                      d="M4.5 8.5 L7 11 L11.5 5.5"
                                      pathLength={1}
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {line}
                                </li>
                              ))}
                            </ul>
                          </InView>
                        ) : null}
                      </div>
                    ) : null}
                    {entry.lesson ? (
                      <blockquote className="border-l-2 border-echo-2 pl-4 text-lg font-medium">
                        <span className="sr-only">{ui.lesson}: </span>
                        {entry.lesson}
                      </blockquote>
                    ) : null}
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                      {entry.stack.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </p>
                  </div>
                </div>
              </details>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
    </LayoutGroup>
  );
}

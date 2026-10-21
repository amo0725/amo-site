"use client";

import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { Suspense, useState, type ReactNode } from "react";
import type { UiStrings, WorkCategory, WorkEntry } from "@/content/types";
import { cn } from "@/lib/cn";
import { useMotionPreference } from "@/lib/motion/preference";
import { PhoneFold } from "@/components/ui/phone-fold";
import { caseAnchor } from "./case-steps";
import { MiniBar } from "./mini-bar";

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
  /** Each case's body, rendered on the server (CaseBody), by entry id. */
  bodies: Readonly<Record<string, ReactNode>>;
}

const ALL = "__all__";

/** Opens a featured case on md-and-up screens when it mounts. */
function openWhenWide(el: HTMLDetailsElement | null) {
  if (el && window.matchMedia("(min-width: 48rem)").matches) el.open = true;
}
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
    // A visible group name: two rows of pills that both start with "All"
    // otherwise read as one row with two "All" buttons.
    <div
      role="group"
      aria-labelledby={`filter-${id}-label`}
      className="md:flex md:items-baseline md:gap-4"
    >
      <p
        id={`filter-${id}-label`}
        className="coord mb-2 md:mb-0 md:w-28 md:shrink-0"
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative isolate flex min-h-10 items-center gap-2 rounded-[2px] border px-3 py-1.5 text-sm transition-colors",
                on
                  ? "border-ink text-paper"
                  : "border-control hover:border-ink",
              )}
            >
              {on ? (
                <m.span
                  layoutId={`pill-${id}`}
                  className="absolute inset-0 -z-10 rounded-[1px] bg-ink"
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
                className={cn(
                  "text-xs font-bold tabular",
                  on ? "text-paper/70" : "text-ink-soft",
                )}
              >
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryMark({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="mark log-mark"
      style={{ background: `var(${color})` }}
    />
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
  bodies,
}: WorkLogProps) {
  const [type, setType] = useState<string>(ALL);
  const [track, setTrack] = useState<string>(ALL);
  // Layout animation only once a filter has been used: before that there
  // is nothing to animate, and measuring a dozen rows on load forces a
  // layout of the whole page while it is still hydrating.
  const [filtered, setFiltered] = useState(false);
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
      {/* Phones: the filters wait behind one line, so the list itself is
          what the section opens with. */}
      <PhoneFold
        className="mb-8"
        summaryClassName="flex items-center justify-between border-y border-graticule py-3 text-sm font-semibold md:sr-only"
        summary={ui.filter}
      >
        <div className="space-y-4 pt-4 md:pt-0">
          <FilterGroup
            id="type"
            label={ui.byType}
            options={typeOptions}
            value={type}
            onChange={(v) => {
              setFiltered(true);
              setType(v);
            }}
          />
          <FilterGroup
            id="track"
            label={ui.byTrack}
            options={trackOptions}
            value={track}
            onChange={(v) => {
              setFiltered(true);
              setTrack(v);
            }}
          />
        </div>
      </PhoneFold>

      <m.ul layout={filtered} className="border-t border-graticule">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((entry) => (
            <m.li
              key={entry.id}
              layout={filtered}
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
                id={caseAnchor(entry.id)}
                className="log-entry group"
                // Served closed: phones get the list as an outline. From
                // md up the featured cases open as they mount (no re-render).
                ref={entry.featured ? openWhenWide : undefined}
                data-featured={entry.featured ? "" : undefined}
              >
                {/* One grid for every row, so the list reads as a table:
                    category, title, a fixed plot column (the before/after
                    strip or the outcome) and the toggle. Phones: title and
                    toggle, then the category, then the plot full width. */}
                <summary className="pen-row grid grid-cols-[1fr_auto] items-start gap-x-4 py-5 md:grid-cols-[7rem_1fr_15rem_1.5rem] md:gap-x-8 md:py-6 xl:grid-cols-[7rem_1fr_18rem_1.5rem]">
                  <span className="hidden items-center gap-2 pt-[0.3rem] text-sm text-ink-soft md:col-start-1 md:row-start-1 md:flex">
                    <CategoryMark color={colors[entry.category]} />
                    {categories[entry.category]}
                  </span>
                  <div className="col-start-1 row-start-1 md:col-start-2">
                    <h3 className="text-lg font-semibold text-balance md:text-xl">
                      {entry.title}
                    </h3>
                    <span className="log-meta coord mt-1.5 flex flex-wrap items-center gap-x-3">
                      <span className="flex items-center gap-2 md:hidden">
                        <CategoryMark color={colors[entry.category]} />
                        {categories[entry.category]}
                      </span>
                      <span>{trackLabel.get(entry.track)}</span>
                    </span>
                  </div>
                  <span className="log-plot col-span-2 col-start-1 row-start-2 mt-3 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0 md:pt-[0.35rem]">
                    {entry.metrics?.[0] ? (
                      <MiniBar metric={entry.metrics[0]} />
                    ) : entry.outcome ? (
                      <span className="flex items-start gap-2 text-sm font-semibold">
                        <span
                          aria-hidden="true"
                          className="mark mt-[0.4em] bg-echo-2"
                        />
                        <span
                          aria-hidden="true"
                          className="leader mt-[0.72em] -ml-1 w-2.5"
                        />
                        <span>{entry.outcome}</span>
                      </span>
                    ) : null}
                  </span>
                  <span
                    aria-hidden="true"
                    className="log-chevron col-start-2 row-start-1 text-2xl leading-none font-light text-ink-soft md:col-start-4"
                  >
                    +
                  </span>
                </summary>
                {/* Server-rendered body in its own Suspense boundary: React
                    hydrates each case as a separate, interruptible task. */}
                <Suspense fallback={null}>{bodies[entry.id]}</Suspense>
              </details>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
    </LayoutGroup>
  );
}

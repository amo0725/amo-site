"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
// The bare m component: the barrel export of "m" pulls the full feature
// set into the first-load bundle and defeats LazyMotion.
import * as m from "motion/react-m";
import {
  useState,
  useSyncExternalStore,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import type { UiStrings, WorkCategory } from "@/content/types";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/i18n";
import { useMotionPreference } from "@/lib/motion/preference";
import { PhoneFold } from "@/components/ui/phone-fold";
import { caseAnchor } from "./case-steps";
import { MiniBar } from "./mini-bar";
import type { WorkLogEntry } from "./log-entry";
import { OPEN_CASES_KEY } from "./open-cases";

export interface TrackOption {
  id: string;
  label: string;
}

interface WorkLogProps {
  entries: readonly WorkLogEntry[];
  tracks: readonly TrackOption[];
  categories: Readonly<Record<WorkCategory, string>>;
  colors: Readonly<Record<WorkCategory, string>>;
  ui: UiStrings["work"];
  /** Each case's body, rendered on the server (CaseBody), by entry id. */
  bodies: Readonly<Record<string, ReactNode>>;
}

const ALL = "__all__";

/* The filters live in the query string (?type=…&track=…), so a filtered
   list can be shared and survives Back. The URL is the source of truth;
   this store re-reads it after every write and on history moves. */
const FILTER_EVENT = "work-filter";
function subscribeQuery(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}
const readQuery = () => window.location.search;
const serverQuery = () => "";

function writeQuery(key: "type" | "track", value: string) {
  const url = new URL(window.location.href);
  if (value === ALL) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(FILTER_EVENT));
}

/**
 * A case opened or closed by the reader: the address follows it, so the
 * Back button (from the case's own page, or after leaving the site) comes
 * back to it open, and the set of open cases is kept for this tab
 * (restored by the pre-paint script, see open-cases.ts).
 */
function onCaseToggle(e: SyntheticEvent<HTMLDetailsElement>) {
  // Only the reader's own toggles: not the pre-paint script's (its toggle
  // events can arrive after hydration), which would put a case nobody
  // asked for into the address.
  if (navigator.userActivation && !navigator.userActivation.isActive) return;
  const el = e.currentTarget;
  const hash = `#${el.id}`;
  const url = new URL(window.location.href);
  if (el.open && url.hash !== hash) {
    url.hash = hash;
    window.history.replaceState(null, "", url);
  } else if (!el.open && url.hash === hash) {
    url.hash = "";
    window.history.replaceState(null, "", url);
  }
  try {
    const open = [...document.querySelectorAll("#work details.log-entry[open]")].map(
      (d) => d.id,
    );
    sessionStorage.setItem(OPEN_CASES_KEY, JSON.stringify(open));
  } catch {
    // Storage can be unavailable (private mode); the address still works.
  }
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
  entries: readonly WorkLogEntry[],
  key: (e: WorkLogEntry) => T,
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
  const query = new URLSearchParams(
    useSyncExternalStore(subscribeQuery, readQuery, serverQuery),
  );
  const pick = (value: string | null, known: readonly string[]) =>
    value && known.includes(value) ? value : ALL;
  const type = pick(query.get("type"), Object.keys(categories));
  const track = pick(
    query.get("track"),
    tracks.map((t) => t.id),
  );
  // Layout animation only once a filter has been used: before that there
  // is nothing to animate, and measuring a dozen rows on load forces a
  // layout of the whole page while it is still hydrating.
  const [filtered, setFiltered] = useState(false);
  // Motion's reducedMotion setting only drops transforms and layout, so the
  // clip-path wipes are switched off here.
  const reduced = useMotionPreference() === "reduced";

  const matches = (e: WorkLogEntry) =>
    (type === ALL || e.category === type) &&
    (track === ALL || e.track === track);
  const matching = entries.filter(matches);
  // A filter that arrives with the address (a shared ?type= link) is
  // applied by hiding rows, not removing them: removal plays an exit
  // animation, and right after hydration Motion's animation features may
  // not have loaded yet to play it. Once the reader filters, rows come
  // and go with their wipes.
  const rows = filtered ? matching : entries;

  const typeCounts = count(entries, (e) => e.category);
  const trackCounts = count(entries, (e) => e.track);
  const trackLabel = new Map(tracks.map((t) => [t.id, t.label]));
  const featured = entries.filter((e) => e.featured).map((e) => e.id);

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
        summaryClassName="flex items-center justify-between border-y border-graticule py-3 text-sm font-semibold"
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
              writeQuery("type", v);
            }}
          />
          <FilterGroup
            id="track"
            label={ui.byTrack}
            options={trackOptions}
            value={track}
            onChange={(v) => {
              setFiltered(true);
              writeQuery("track", v);
            }}
          />
        </div>
      </PhoneFold>
      {/* Says how many cases a filter left, for readers who can't see the
          rows go. Empty until a filter is used. */}
      <p role="status" className="sr-only">
        {filtered ? fill(ui.showing, { count: matching.length }) : ""}
      </p>

      <m.ul layout={filtered} className="border-t border-graticule">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((entry) => (
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
              hidden={!filtered && !matches(entry) ? true : undefined}
              className="border-b border-graticule"
            >
              {/* Served closed. A script right after the list opens the
                  featured cases before the first paint (all three from md,
                  the first on phones), so a shared link lands once; their
                  figures play when scrolled into view (data-featured). */}
              <details
                id={caseAnchor(entry.id)}
                className="log-entry group"
                data-featured={entry.featured ? "" : undefined}
                onToggle={onCaseToggle}
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
                  <span className="col-start-1 row-start-1 block md:col-start-2">
                    {entry.featured ? (
                      <span className="log-featured coord mb-1.5 flex items-center gap-2 text-echo-2-ink">
                        <span
                          aria-hidden="true"
                          className="mark rounded-full bg-echo-2"
                        />
                        {fill(ui.featured, {
                          n: featured.indexOf(entry.id) + 1,
                          of: featured.length,
                        })}
                      </span>
                    ) : null}
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
                  </span>
                  <span className="log-plot col-span-2 col-start-1 row-start-2 mt-3 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0 md:pt-[0.35rem]">
                    {entry.metrics?.[0] ? (
                      <MiniBar metric={entry.metrics[0]} to={ui.to} />
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
                {/* Server-rendered body, in the HTML with its row: a body in a
                    Suspense boundary of its own streams in after the list
                    and grows it after a #link has landed. */}
                {bodies[entry.id]}
              </details>
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
    </LayoutGroup>
  );
}

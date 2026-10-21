"use client";

import type { Ref } from "react";
import type { ReelCopy, SignalStateName } from "@/content/types";
import { cn } from "@/lib/cn";
import { BEAT, DURATION, SIGNAL_STATES } from "./timing";

const BEATS = Math.round(DURATION / BEAT);
const CHAPTER_COLORS = [
  "--echo-2",
  "--echo-4",
  "--echo-1",
  "--echo-5",
  "--echo-6",
] as const;

const pct = (t: number) => `${(t / DURATION) * 100}%`;

/** A tiny drawing of each shape the signal takes, in the reel's green. */
function StateGlyph({ id }: { id: SignalStateName }) {
  const base = "block border-2 border-echo-2";
  switch (id) {
    case "dot":
      return <span className={cn(base, "size-2.5 rounded-full bg-echo-2")} />;
    case "packet":
      return <span className={cn(base, "size-2.5 rotate-45 bg-echo-2")} />;
    case "inbox":
      return <span className={cn(base, "h-4 w-3 rounded-[3px] bg-transparent")} />;
    case "pen":
      return (
        <svg viewBox="0 0 20 12" className="h-3 w-5 text-echo-2" aria-hidden="true">
          <path
            d="M0 7 H6 L8 2 L10 11 L12 7 H20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "gate":
      return <span className={cn(base, "size-3 rotate-45 bg-transparent")} />;
    case "bar":
      return <span className="block h-1 w-5 bg-echo-2" />;
  }
}

interface MakingOfProps {
  copy: ReelCopy;
  ready: boolean;
  /** The player moves this element with the reel's clock. */
  playheadRef: Ref<HTMLSpanElement>;
  onSeek: (t: number) => void;
}

/**
 * How the reel is put together: the concept, a beat map that follows the
 * playhead and seeks on click, the rules it keeps, and the MP4 export.
 */
export function MakingOf({ copy, ready, playheadRef, onSeek }: MakingOfProps) {
  const m = copy.making;
  const chapters = copy.chapters;
  return (
    <details className="log-entry group mt-8 border-t border-graticule">
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-lg font-semibold">
        {m.label}
        <span
          aria-hidden="true"
          className="log-chevron text-2xl leading-none font-light text-ink-soft"
        >
          +
        </span>
      </summary>

      <div className="grid gap-10 pb-6 md:grid-cols-12 md:gap-8">
        <div className="space-y-6 md:col-span-5">
          <p className="max-w-[34rem]">{m.concept}</p>
          <div>
            <h3 className="text-sm font-semibold text-ink-soft">
              {m.rulesLabel}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {m.rules.map((r) => (
                <li key={r} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] h-px w-3 shrink-0 bg-coast"
                  />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-soft">
              {m.avoidLabel}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-soft">
              {m.avoid.map((a) => (
                <li key={a} className="line-through decoration-coast">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-7">
          <p className="text-sm text-ink-soft">{m.mapLabel}</p>

          {/* The beat map. */}
          <div className="relative mt-4 select-none">
            {/* Chapters: click to jump. */}
            <ol className="relative h-10">
              {chapters.map((c, i) => {
                const end = chapters[i + 1]?.at ?? DURATION;
                return (
                  <li
                    key={c.id}
                    className="absolute inset-y-0"
                    style={{ left: pct(c.at), width: pct(end - c.at) }}
                  >
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => onSeek(c.at + 0.01)}
                      className="flex h-full w-full flex-col justify-end gap-1.5 pr-1 text-left text-xs disabled:opacity-40"
                    >
                      <span className="hidden truncate sm:block">{c.title}</span>
                      <span
                        aria-hidden="true"
                        className="block h-1.5 w-full"
                        style={{ background: `var(${CHAPTER_COLORS[i % CHAPTER_COLORS.length]})` }}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Beats: every beat a tick, every bar of four a longer one. */}
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${BEATS} 10`}
              preserveAspectRatio="none"
              className="mt-1 block h-3 w-full text-coast"
            >
              {Array.from({ length: BEATS + 1 }, (_, i) => (
                <line
                  key={i}
                  x1={i}
                  x2={i}
                  y1={0}
                  y2={i % 4 === 0 ? 10 : 4}
                  stroke="currentColor"
                  strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* Where the signal changes shape. */}
            <ol className="relative mt-2 h-12">
              {SIGNAL_STATES.map((s, i) => (
                <li
                  key={`${s.id}-${i}`}
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5"
                  style={{ left: pct(s.at) }}
                >
                  <span className="flex h-4 items-center">
                    <StateGlyph id={s.id} />
                  </span>
                  <span
                    className={cn(
                      "hidden text-[0.6875rem] whitespace-nowrap text-ink-soft lg:block",
                      // The last two sit close together; lift the final one.
                      i === SIGNAL_STATES.length - 1 && "translate-y-3.5",
                    )}
                  >
                    {m.states[s.id]}
                  </span>
                </li>
              ))}
            </ol>

            {/* Playhead, moved by the player. */}
            <span
              ref={playheadRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2 bg-ink"
              style={{ left: "0%" }}
            />
          </div>

          {/* On small screens the shape names read as one chain. */}
          <p className="mt-4 text-sm text-ink-soft lg:hidden">
            {SIGNAL_STATES.map((s) => m.states[s.id]).join(" → ")}
          </p>

          <p className="mt-6 max-w-[40rem] text-ink-soft">{m.build}</p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a
              href={copy.video.src}
              download
              className="font-semibold underline decoration-coast underline-offset-4 hover:decoration-ink"
            >
              {m.download}
            </a>
            <span className="text-sm text-ink-soft">{m.downloadMeta}</span>
          </p>
        </div>
      </div>
    </details>
  );
}

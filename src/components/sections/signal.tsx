import { InView } from "@/components/motion/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { SectionCopy, SignalContent, UiStrings } from "@/content/types";

interface SignalProps {
  signal: SignalContent;
  copy: SectionCopy;
  ui: UiStrings["signal"];
}

/**
 * Concentric range rings that swell and turn as the section scrolls past.
 * The rings draw themselves in, innermost first, over the first part of it.
 */
function RangeRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox="-100 -100 200 200"
      className="rings-turn pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[140vmax] max-w-none"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <g fill="none" stroke="var(--graticule)" strokeWidth="0.15">
        {[18, 34, 50, 66, 82, 98].map((r, i) => (
          <circle
            key={r}
            r={r}
            pathLength={1}
            className="ring-draw"
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 18}
              y1={Math.sin(a) * 18}
              x2={Math.cos(a) * 98}
              y2={Math.sin(a) * 98}
            />
          );
        })}
      </g>
      <path
        d="M0 0 L0 -98 A98 98 0 0 1 49 -84.9 Z"
        fill="var(--band-1)"
        opacity="0.08"
      />
    </svg>
  );
}

/**
 * What I do, shown as evidence: four things that looked healthy and were
 * broken, each linking to the case where it happened, then how such a
 * problem is traced. Every word is on screen from the start; the only
 * motion is the "actually" marks lighting up once, in turn, as the cards
 * arrive (see .vs-card in globals.css).
 */
export function Signal({ signal, copy, ui }: SignalProps) {
  const meta = sectionMeta("signal");
  // overflow-clip, not overflow-hidden: a hidden box is a scroll container,
  // and every view() timeline inside it would bind to it and stay frozen.
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="relative isolate overflow-clip px-5 py-20 md:px-10 md:py-36"
    >
      <RangeRings />
      <div className="mx-auto grid max-w-[90rem] md:grid-cols-12">
        <div className="md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
          <SectionHeading id={meta.id} colorVar={meta.colorVar}>
            {copy.label}
          </SectionHeading>
          <p className="max-w-[24em] text-[1.375rem] leading-[1.45] font-semibold tracking-tight text-balance md:text-[2.15rem]">
            {signal.claim}
          </p>

          <InView threshold={0.35}>
            <ul className="mt-8 grid gap-2.5 md:mt-12 md:grid-cols-2 md:gap-4">
              {signal.pairs.map((pair, i) => (
                <li
                  key={pair.href}
                  className="vs-card"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <a
                    href={pair.href}
                    className="group grid h-full grid-cols-2 border border-graticule bg-paper-raised transition-colors hover:border-control"
                  >
                    <span className="vs-looks grid content-start gap-1 p-3 md:p-4">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                        <span aria-hidden="true" className="text-echo-2">
                          ✓
                        </span>
                        {ui.looks}
                      </span>
                      <span className="text-sm text-ink-soft md:text-base">
                        {pair.looks}
                      </span>
                    </span>
                    <span className="vs-actually grid content-start gap-1 border-l border-graticule p-3 md:p-4">
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <span aria-hidden="true" className="vs-mark text-echo-5">
                          ✕
                        </span>
                        {ui.actually}
                      </span>
                      <span className="text-sm font-semibold md:text-base">
                        {pair.actually}
                        <span
                          aria-hidden="true"
                          className="ml-1 inline-block text-ink-soft transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </InView>

          <div className="mt-8 md:mt-12">
            <p className="text-sm text-ink-soft">{ui.trail}</p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
              {signal.trail.map((step, i) => {
                const last = i === signal.trail.length - 1;
                return (
                  <li key={step} className="flex items-center gap-2">
                    {i > 0 ? (
                      <span aria-hidden="true" className="text-ink-soft">
                        →
                      </span>
                    ) : null}
                    <span
                      className={
                        last
                          ? "border border-echo-2 px-2.5 py-1 font-semibold"
                          : "border border-graticule bg-paper-raised px-2.5 py-1"
                      }
                    >
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-8 md:mt-10">
            <h3 className="text-sm text-ink-soft">{ui.context}</h3>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {signal.context.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-control px-3 py-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

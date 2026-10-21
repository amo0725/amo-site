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
 * What I do, shown as evidence, plotted rather than boxed: four readings,
 * each a hollow mark "looks fine" joined by a leader arrow to a red mark
 * "actually", the whole row linking to the case where it happened. Then
 * the trace path drawn with the same stations as the experience flow, and
 * the working context as a legend. Every word is there from the start; on
 * arrival the arrows draw and the red marks ink in, once.
 */
export function Signal({ signal, copy, ui }: SignalProps) {
  const meta = sectionMeta("signal");
  const last = signal.trail.length - 1;
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

          <InView threshold={0.25}>
            {/* One grid for all four rows (subgrid), so the "looks fine"
                column is as wide as its longest reading and the leader
                arrow runs all the way to the "actually" column. */}
            <ul className="mt-8 border-b border-graticule md:mt-12 md:grid md:grid-cols-[minmax(0,auto)_minmax(3rem,1fr)_minmax(0,auto)]">
              {signal.pairs.map((pair, i) => (
                <li
                  key={pair.href}
                  className="md:col-span-3 md:grid md:grid-cols-subgrid"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <a
                    href={pair.href}
                    className="vs-row group relative grid gap-y-1 border-t border-graticule py-3.5 md:col-span-3 md:grid-cols-subgrid md:items-start md:gap-x-0 md:py-5"
                  >
                    <span className="grid grid-cols-[1rem_1fr] items-start gap-x-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.3rem] size-2.5 rounded-full border-[1.5px] border-control"
                      />
                      <span className="grid gap-0.5">
                        <span className="coord">{ui.looks}</span>
                        <span className="text-ink-soft">{pair.looks}</span>
                      </span>
                    </span>
                    {/* The leader between the two readings: down on
                        phones, across from md up. */}
                    <span
                      aria-hidden="true"
                      className="relative ml-[0.3rem] h-3 w-px md:mt-[1.65rem] md:ml-4 md:h-px md:w-auto"
                    >
                      <span className="vs-arrow absolute inset-0 bg-control" />
                      <span className="absolute -bottom-1 -left-[3px] hidden border-x-[3.5px] border-t-[5px] border-x-transparent border-t-control max-md:block" />
                      <span className="absolute top-[-3.5px] -right-px hidden border-y-[3.5px] border-l-[5px] border-y-transparent border-l-control md:block" />
                    </span>
                    <span className="vs-actually relative grid grid-cols-[1rem_1fr] items-start gap-x-3 md:pl-6">
                      <span
                        aria-hidden="true"
                        className="vs-mark mark mt-[0.3rem] bg-echo-5"
                      />
                      <span className="grid gap-0.5">
                        <span className="coord text-echo-5-ink">
                          {ui.actually}
                        </span>
                        <span className="font-semibold">
                          {pair.actually}
                          <span
                            aria-hidden="true"
                            className="ml-1.5 inline-block text-ink-soft transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </InView>

          <figure className="mt-12 md:mt-16">
            <figcaption className="coord">{ui.trail}</figcaption>
            <InView threshold={0.25}>
              <ol
                className="flow-path relative mt-5 grid gap-3.5 md:gap-7"
                style={{ "--stops": signal.trail.length } as React.CSSProperties}
              >
                {signal.trail.map((step, i) => (
                  <li
                    key={step}
                    className="flow-stop relative grid grid-cols-[1.75rem_1fr] items-center gap-x-3 md:grid-cols-1 md:items-start md:gap-y-2.5"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span
                      aria-hidden="true"
                      className={i === last ? "node node-live" : "node"}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={
                        i === last
                          ? "max-w-[18em] font-bold text-balance"
                          : "text-sm font-semibold"
                      }
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </InView>
          </figure>

          <div className="mt-12 md:mt-14">
            <h3 className="coord">{ui.context}</h3>
            <ul className="mt-3 grid gap-x-10 gap-y-2 md:grid-cols-2">
              {signal.context.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="leader mt-[0.85em]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

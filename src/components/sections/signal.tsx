import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { SectionCopy, SignalContent } from "@/content/types";

interface SignalProps {
  signal: SignalContent;
  copy: SectionCopy;
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
 * What I do, said plainly: the claim, four times it was true (each what
 * looked fine and what was actually broken, in one sentence that links to
 * where it happened), how I trace and fix such things, and how I work.
 */
export function Signal({ signal, copy }: SignalProps) {
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
          <p className="max-w-[24em] text-[1.375rem] leading-[1.45] font-semibold tracking-tight text-balance md:text-[2.15rem] [:lang(zh)_&]:leading-[1.5]">
            {signal.claim}
          </p>

          <ul className="mt-8 max-w-[44rem] border-t border-graticule md:mt-12">
            {signal.pairs.map((pair) => (
              <li key={pair.href} className="border-b border-graticule">
                <a
                  href={pair.href}
                  className="vs-row group grid grid-cols-[0.625rem_1fr] items-baseline gap-x-4 py-4 md:text-lg"
                >
                  <span aria-hidden="true" className="mark bg-echo-5" />
                  <span>
                    <span className="text-ink-soft">{pair.looks}</span>
                    {pair.looks.endsWith("，") ? "" : " "}
                    <span className="font-semibold underline decoration-control decoration-1 underline-offset-[0.3em] transition-colors group-hover:decoration-ink">
                      {pair.actually}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-block text-ink-soft transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-[40rem] md:text-lg">{signal.trace}</p>
          <p className="mt-4 max-w-[40rem]">{signal.context}</p>
        </div>
      </div>
    </section>
  );
}

import { ScrubText } from "@/components/motion/scrub-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { Profile, SectionCopy } from "@/content/types";

interface SignalProps {
  profile: Profile;
  copy: SectionCopy;
  locale: string;
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

export function Signal({ profile, copy, locale }: SignalProps) {
  const meta = sectionMeta("signal");
  // overflow-clip, not overflow-hidden: a hidden box is a scroll container,
  // and every view() timeline inside it (the inked words, the heading scan,
  // the rings) would bind to it and stay frozen at 50%.
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="relative isolate overflow-clip px-5 py-28 md:px-10 md:py-44"
    >
      <RangeRings />
      <div className="mx-auto grid max-w-[90rem] md:grid-cols-12">
        <div className="md:col-span-9 md:col-start-3 lg:col-span-8 lg:col-start-3">
          <SectionHeading id={meta.id} colorVar={meta.colorVar}>
            {copy.label}
          </SectionHeading>
          <ScrubText
            text={profile.statement}
            locale={locale}
            className="max-w-[24em] text-[1.6rem] leading-[1.6] font-medium tracking-tight md:text-[2.15rem] md:leading-[1.55]"
          />
          <p className="mt-12 max-w-[32rem] text-ink-soft md:ml-[30%]">
            {profile.aside}
          </p>
        </div>
      </div>
    </section>
  );
}

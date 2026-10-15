import { KineticName } from "@/components/motion/kinetic-name";
import { LocalClock } from "@/components/ui/local-clock";
import { MotionToggle } from "@/components/ui/motion-toggle";
import type { Profile, UiStrings } from "@/content/types";
import { HeroVisual } from "@/features/radar/hero-visual";
import { RadarPoster } from "@/features/radar/radar-poster";

const LEGEND = [
  "--echo-1",
  "--echo-2",
  "--echo-3",
  "--echo-4",
  "--echo-5",
  "--echo-6",
];

interface HeroProps {
  profile: Profile;
  ui: UiStrings["hero"];
}

export function Hero({ profile, ui }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] touch-pan-y flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <HeroVisual poster={<RadarPoster />} />
        {/* Keep the header and text legible where the field runs under them. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-paper to-transparent" />
        {/* Bottom scrim: full width on phones, where the text is one column;
            from md up it covers only the left text column (see .hero-scrim). */}
        <div className="hero-scrim pointer-events-none absolute bottom-0 left-0 h-3/5 w-full bg-gradient-to-t from-paper via-paper/80 to-transparent" />
      </div>

      <div
        className="load-wipe absolute top-[calc(var(--header-h)+1rem)] left-5 text-sm text-ink-soft md:left-10"
      >
        <p className="tabular">
          {ui.timeLabel}{" "}
          <LocalClock
            id="hero-clock"
            timeZone={profile.timeZone}
            className="text-ink"
          />
        </p>
        <p>{profile.focus}</p>
      </div>

      <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-5 pb-10 md:grid-cols-12 md:px-10 md:pb-14">
        <div className="md:col-span-12">
          <h1 id="hero-title" className="leading-[0.8] tracking-[-0.04em]">
            <span className="sr-only">{profile.a11yName}</span>
            <KineticName
              text={profile.name}
              // Size containment makes the name its own layout root, so the width
              // animation never re-lays out the rest of the page.
              className="flex h-[0.86em] w-full items-end [contain:size_layout_style] text-[clamp(6.5rem,30vw,21rem)]"
            />
          </h1>
        </div>
        <div className="md:col-span-7">
          <p
            className="load-wipe max-w-[34rem] text-lg leading-relaxed md:text-xl"
          >
            <strong className="font-semibold">{profile.headline}</strong>
            {profile.summary}
          </p>
        </div>

        <div
          className="load-wipe flex flex-col justify-end gap-3 text-sm text-ink-soft md:col-span-4 md:col-start-9 md:items-end md:text-right"
        >
          <figure className="w-full max-w-[16rem]">
            <div className="flex h-2" aria-hidden="true">
              {LEGEND.map((v) => (
                <span
                  key={v}
                  className="flex-1"
                  style={{ background: `var(${v})` }}
                />
              ))}
            </div>
            <figcaption className="mt-1.5 flex justify-between text-xs">
              <span>{ui.legendWeak}</span>
              <span>{ui.legendStrong}</span>
            </figcaption>
          </figure>
          <MotionToggle
            label={ui.motionLabel}
            on={ui.motionOn}
            off={ui.motionOff}
          />
        </div>
      </div>
    </section>
  );
}

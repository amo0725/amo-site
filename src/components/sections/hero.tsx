import { KineticName } from "@/components/motion/kinetic-name";
import { LocalClock } from "@/components/ui/local-clock";
import type { Profile, UiStrings } from "@/content/types";
import { HeroVisual } from "@/features/radar/hero-visual";
import { RadarPoster } from "@/features/radar/radar-poster";
import { fill } from "@/lib/i18n";

interface HeroProps {
  profile: Profile;
  ui: UiStrings["hero"];
  /** Number of cases in the log, for the main call to action. */
  caseCount: number;
  githubHref: string;
}

/**
 * First screen. Reading order is the hiring order: who (name and title),
 * what I'm for (one positioning line), the evidence in two sentences, and
 * where to check it (the case log and the code). The radar field stays as
 * the backdrop; the scrim keeps every line of text on plain paper.
 */
export function Hero({ profile, ui, caseCount, githubHref }: HeroProps) {
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
            from lg up it covers only the left text column (see .hero-scrim). */}
        <div className="hero-scrim pointer-events-none absolute bottom-0 left-0 h-[88%] w-full bg-gradient-to-t from-paper from-70% via-paper/95 to-transparent" />
      </div>

      <p className="load-wipe absolute top-[calc(var(--header-h)+1rem)] left-5 text-sm text-ink-soft tabular md:left-10">
        {ui.timeLabel}{" "}
        <LocalClock
          id="hero-clock"
          timeZone={profile.timeZone}
          className="text-ink"
        />
      </p>

      <div className="mx-auto grid w-full max-w-[90rem] gap-y-7 px-5 pb-10 md:grid-cols-12 md:gap-x-8 md:px-10 md:pb-14">
        <div className="md:col-span-12">
          <h1 id="hero-title" className="leading-[0.8] tracking-[-0.04em]">
            <span className="sr-only">{profile.a11yName}</span>
            <KineticName
              text={profile.fullName}
              // Size containment makes the name its own layout root, so the width
              // animation never re-lays out the rest of the page.
              className="flex h-[0.86em] w-full items-end [contain:size_layout_style] text-[clamp(3.25rem,10.5vw,9.5rem)]"
            />
          </h1>
          <p className="load-wipe mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base md:text-lg">
            <span className="font-semibold">{profile.nativeName}</span>
            <span aria-hidden="true" className="text-coast">
              /
            </span>
            <span className="font-semibold">{profile.role}</span>
            <span className="text-ink-soft">{profile.specialty}</span>
            <span aria-hidden="true" className="text-coast">
              /
            </span>
            <span className="text-ink-soft">{profile.place}</span>
          </p>
        </div>

        <div className="md:col-span-9 lg:col-span-7">
          <p className="load-wipe max-w-[16em] text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.15] font-extrabold tracking-[-0.01em]">
            {profile.positioning}
          </p>
          <p className="load-wipe mt-5 max-w-[38rem] text-lg leading-relaxed">
            {profile.summary}
          </p>
          <p className="load-wipe mt-3 max-w-[38rem] text-sm text-ink-soft">
            {profile.focus}
          </p>
          <div className="load-wipe mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-transform active:scale-95"
            >
              {fill(ui.ctaWork, { count: caseCount })}
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href={githubHref}
              target="_blank"
              rel="me noopener"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink px-6 font-semibold transition-colors hover:bg-paper-raised"
            >
              {ui.ctaGithub}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

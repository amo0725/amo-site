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
 * First screen. Figure and ground are kept apart: the radar field owns the
 * right of the section on desktop (the space above the copy on phones) and
 * fades out before the text, so no line of copy sits on the colour cells and
 * no scrim is needed. Three tiers of type: who (title line, name), what for
 * (one positioning line), and the proof (three figures), then the way in.
 */
export function Hero({ profile, ui, caseCount, githubHref }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] touch-pan-y flex-col overflow-hidden pt-[var(--header-h)]"
    >
      {/* Below lg the clock sits over the faded top edge of the field
          instead of taking a row of its own. */}
      <div className="z-10 mx-auto w-full max-w-[90rem] px-5 pt-4 max-lg:absolute max-lg:inset-x-0 max-lg:top-[var(--header-h)] md:px-10">
        <p className="load-wipe text-sm text-ink-soft tabular">
          {ui.timeLabel}{" "}
          <LocalClock
            id="hero-clock"
            timeZone={profile.timeZone}
            className="text-ink"
          />
          <span className="text-ink-soft">{ui.offset}</span>
        </p>
      </div>

      {/* The field is a region of its own. Below lg it is a block in the flow
          that takes the height left above the copy (at least 30% of a phone
          screen; less on short phones). From lg it is pinned to the
          right half of the section, its left fifth fading out before the
          copy. */}
      <div className="hero-field relative -z-10 min-h-[30svh] flex-1 [@media(max-height:700px)]:min-h-[24svh] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[52%] lg:min-h-0 lg:[@media(max-height:700px)]:min-h-0">
        <HeroVisual poster={<RadarPoster />} />
      </div>

      {/* Short screens (a 1280×720 laptop, an iPhone SE) tighten the
          vertical rhythm so the calls to action stay on the first screen. */}
      <div className="mx-auto grid w-full max-w-[90rem] px-5 pt-2 pb-8 md:px-10 md:pb-12 lg:mt-auto lg:grid-cols-12 lg:gap-x-8 [@media(max-height:760px)]:md:pb-6">
        <div className="lg:col-span-7">
          {/* The separators are real text, so a screen reader hears the
              title line as three parts rather than one run-on phrase. */}
          <p className="load-wipe load-wipe-early text-base text-ink md:text-lg">
            <span lang="zh-Hant-TW" className="font-semibold">
              {profile.nativeName}
            </span>
            <span className="text-ink-soft"> / </span>
            <span className="font-semibold">{profile.role}</span>{" "}
            <span className="whitespace-nowrap">{profile.specialty}</span>
            <span className="hidden text-ink-soft sm:inline">
              <span className="text-ink-soft"> / </span>
              {profile.place}
            </span>
          </p>
          <h1 id="hero-title" className="mt-3 leading-[0.8] tracking-[-0.04em]">
            <span className="sr-only">{profile.a11yName}</span>
            <KineticName
              text={profile.fullName}
              // Size containment makes the name its own layout root, so the width
              // animation never re-lays out the rest of the page.
              // Narrow phones scale the name with the width, so it never runs
              // past the edge (320px, or with user text spacing).
              className="flex h-[0.86em] w-full items-end select-none [contain:size_layout_style] text-[min(11.5vw,3.25rem)] md:text-[clamp(3.25rem,min(8vw,13svh),7.5rem)]"
            />
          </h1>

          {/* No entrance animation: this is the largest block of text on the
              first screen, so it paints with the page. keep-all: Chinese
              breaks at the comma rather than mid-phrase; balance evens out
              the English lines. */}
          <p className="mt-5 max-w-[16em] text-[clamp(1.625rem,min(3.4vw,5.5svh),3rem)] leading-[1.15] font-extrabold tracking-[-0.01em] text-balance [word-break:keep-all] md:mt-7 [@media(max-height:760px)]:mt-4">
            {profile.positioning}
          </p>

          {/* Each row is its own grid with a fixed figure column (wide
              enough for "2,000+"), so the rule above a row runs unbroken. */}
          {/* Phones: a three-column strip, figure over a short label. From
              md: one row per figure with the full label. */}
          <dl className="load-wipe load-wipe-early mt-5 grid max-w-[38rem] grid-cols-3 gap-x-4 border-t border-graticule pt-3 md:mt-7 md:block md:border-0 md:pt-0 [@media(max-height:760px)]:mt-4">
            {profile.proof.map((p) => (
              <div
                key={p.figure}
                className="min-w-0 md:grid md:grid-cols-[7.75rem_1fr] md:items-baseline md:gap-x-3 md:border-t md:border-graticule md:py-3 [@media(max-height:760px)]:md:py-2"
              >
                <dt className="text-xl leading-none font-extrabold whitespace-nowrap text-echo-2 tabular md:text-2xl">
                  {p.figure}
                </dt>
                <dd className="mt-1.5 text-[0.8125rem] leading-snug text-ink-soft [word-break:keep-all] [overflow-wrap:anywhere] md:mt-0 md:text-base md:text-balance md:text-ink">
                  <span className="md:hidden">{p.short}</span>
                  <span className="hidden md:inline">{p.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          {/* What a recruiter checks first: what I am open to, and where. */}
          <p className="load-wipe load-wipe-early mt-5 flex items-baseline gap-2.5 text-sm font-semibold md:mt-6 [@media(max-height:760px)]:mt-4">
            <span
              aria-hidden="true"
              className="mark translate-y-[-0.05em] rounded-full bg-echo-2"
            />
            {profile.status}
          </p>

          <div className="load-wipe load-wipe-early mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 md:mt-5 [@media(max-height:760px)]:mt-3">
            <a
              href="#work"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-4 font-semibold text-paper transition-transform active:scale-95 min-[380px]:px-5 sm:px-6"
            >
              {fill(ui.ctaWork, { count: caseCount })}
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ink px-4 font-semibold transition-colors hover:bg-paper-raised min-[380px]:px-5 sm:px-6"
            >
              <span className="sm:hidden">{ui.ctaContactShort}</span>
              <span className="hidden sm:inline">{ui.ctaContact}</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={githubHref}
              target="_blank"
              rel="me noopener"
              className="group inline-flex h-12 items-center gap-1.5 px-2 font-semibold"
            >
              <span className="underline decoration-graticule decoration-2 underline-offset-4 transition-colors group-hover:decoration-ink">
                {ui.ctaGithub}
              </span>
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
          </div>
          {/* The stack, for readers scanning for keywords, when the screen
              is tall enough; from md the reel is one click away beside it. */}
          <div className="load-wipe load-wipe-early mt-4 flex max-w-[38rem] flex-wrap items-baseline gap-x-6 gap-y-1 md:mt-5 [@media(max-height:760px)]:hidden">
            <p className="text-[0.8125rem] text-ink-soft">{profile.focus}</p>
            <a href="#reel" className="go hidden md:inline-flex">
              {ui.ctaReel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

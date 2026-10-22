import { InView } from "@/components/motion/in-view";
import { PhoneFold } from "@/components/ui/phone-fold";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  ExperienceTrack,
  Locale,
  SectionCopy,
  UiStrings,
} from "@/content/types";
import { AreaList } from "@/features/experience/area-list";
import { TrackFlowView } from "@/features/experience/track-flow";
import { fill } from "@/lib/i18n";

interface ExperienceProps {
  tracks: readonly ExperienceTrack[];
  copy: SectionCopy;
  ui: UiStrings["experience"];
  locale: Locale;
}

export const TRACK_COLORS = ["--band-2", "--band-6"];

/** A body of work's own page, with the full write-up. */
export const trackHref = (locale: Locale, id: string) =>
  `/${locale}/experience/${id}`;

/**
 * Headline figures under a track's title, as readings on a scale: a ruled
 * axis with ticks, the figure in expanded tabular numerals, its label. The
 * rule draws once on arrival.
 */
export function TrackStats({ track }: { track: ExperienceTrack }) {
  if (!track.stats?.length) return null;
  return (
    <InView threshold={0.4}>
      <dl className="mt-7 grid max-w-[30rem] grid-cols-3 gap-3 md:gap-4">
        {track.stats.map((s, i) => (
          <div
            key={s.label}
            className="grid content-start"
            style={{ "--i": i } as React.CSSProperties}
          >
            <dt className="order-2 mt-1.5 text-xs leading-snug text-balance text-ink-soft">
              {s.label}
            </dt>
            <dd className="order-1 grid">
              <span
                aria-hidden="true"
                className="tile-rule block h-0.5 bg-ink"
              />
              <span aria-hidden="true" className="axis-ticks" />
              <span className="mt-2 text-xl leading-none font-extrabold tabular font-expanded 2xl:text-[1.75rem]">
                {s.figure}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </InView>
  );
}

/** A track's kicker: its pen colour, its index, and a short rule. */
export function TrackKicker({
  index,
  color,
}: {
  index: number;
  color: string;
}) {
  return (
    <p aria-hidden="true" className="mb-5 flex items-center gap-3">
      <span className="mark" style={{ background: color }} />
      <span className="index">{String(index + 1).padStart(2, "0")}</span>
      <span
        className="grow-x h-0.5 w-16 origin-left"
        style={{ background: color }}
      />
    </p>
  );
}

/**
 * Bodies of work, one after the other. Described by domain and scope,
 * not by employer or dates: what the reader needs is what was owned.
 */
export function Experience({ tracks, copy, ui, locale }: ExperienceProps) {
  const meta = sectionMeta("experience");
  const main = tracks.filter((t) => !t.earlier);
  const earlier = tracks.filter((t) => t.earlier);
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule px-5 py-16 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} lead={copy.lead}>
          {copy.label}
        </SectionHeading>

        <div className="space-y-20 md:space-y-28">
          {main.map((track, t) => {
            const color = `var(${TRACK_COLORS[t % TRACK_COLORS.length]})`;
            return (
              <article
                key={track.id}
                aria-labelledby={`xp-${track.id}`}
                className="grid gap-8 md:gap-10 lg:grid-cols-12"
              >
                <header className="lg:col-span-5 lg:self-start xl:col-span-4 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                  <TrackKicker index={t} color={color} />
                  <h3
                    id={`xp-${track.id}`}
                    className="text-[2rem] leading-[0.95] font-extrabold font-expanded [overflow-wrap:anywhere] sm:text-4xl md:text-5xl lg:text-[2.5rem] xl:text-5xl"
                  >
                    {track.short}
                  </h3>
                  <p className="mt-4 text-ink-soft">
                    {track.tagline ?? track.role}
                  </p>
                  <TrackStats track={track} />
                  <a href={trackHref(locale, track.id)} className="go mt-6">
                    {ui.full}
                    <span className="sr-only">: {track.short}</span>
                  </a>
                </header>

                <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                  {track.flow ? (
                    <TrackFlowView track={track} flow={track.flow} ui={ui} />
                  ) : (
                    <p className="max-w-[40rem] leading-relaxed md:text-lg">
                      {track.summary}
                    </p>
                  )}

                  {/* Phones: the drawing is the overview, so the list of
                      areas waits behind one line (a badge on the drawing
                      opens it at its area). From md up it is shown. */}
                  <PhoneFold
                    className="mt-8 md:mt-10"
                    summaryClassName="flex items-center justify-between border-y border-graticule py-3 text-sm font-semibold"
                    summary={fill(ui.areas, { count: track.areas.length })}
                    wide={
                      <p className="coord mb-3">
                        {fill(ui.areas, { count: track.areas.length })}
                      </p>
                    }
                  >
                    <AreaList track={track} ui={ui} />
                  </PhoneFold>

                  <PhoneFold
                    className="md:mt-6"
                    summaryClassName="flex items-center justify-between border-b border-graticule py-4 text-sm font-semibold"
                    summary={
                      <span>
                        {ui.stack}
                        <span className="sr-only">: {track.short}</span>
                      </span>
                    }
                    wide={<p className="coord">{ui.stack}</p>}
                  >
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-3 pb-2 text-sm md:pt-2">
                      {track.stack.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </PhoneFold>
                </div>
              </article>
            );
          })}
        </div>

        {earlier.length > 0 ? (
          <div className="mt-20 border-t border-graticule pt-10 md:mt-28">
            <h3 className="coord">
              {ui.earlier}
            </h3>
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              {earlier.map((track) => (
                <article key={track.id} aria-labelledby={`xp-${track.id}`}>
                  <h4
                    id={`xp-${track.id}`}
                    className="text-2xl font-extrabold font-expanded"
                  >
                    {track.short}
                  </h4>
                  <p className="mt-2">{track.domain}</p>
                  <p className="mt-1 text-sm font-semibold">{track.role}</p>
                  {/* Phones: the summary and highlights wait behind one
                      line; from md up they are shown. */}
                  <PhoneFold
                    className="mt-4"
                    summaryClassName="flex items-center justify-between border-y border-graticule py-3 text-sm font-semibold"
                    summary={
                      <span>
                        {fill(ui.highlights, { count: track.areas.length })}
                        <span className="sr-only">: {track.short}</span>
                      </span>
                    }
                  >
                    <p className="mt-3 max-w-[36rem] text-ink-soft md:mt-0">
                      {track.summary}
                    </p>
                    {track.areas.length > 0 ? (
                      <ul className="mt-4 space-y-2 text-ink-soft">
                        {track.areas.map((area) => (
                          <li key={area.title} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="leader mt-[0.85em]"
                            />
                            <span>
                              <span className="font-semibold text-ink">
                                {area.title}
                              </span>{" "}
                              {area.body}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </PhoneFold>
                  <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                    {track.stack.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

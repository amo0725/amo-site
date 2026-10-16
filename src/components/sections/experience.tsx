import { PhoneFold } from "@/components/ui/phone-fold";
import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  ExperienceTrack,
  ScopeArea,
  SectionCopy,
  UiStrings,
} from "@/content/types";
import { fill } from "@/lib/i18n";

interface ExperienceProps {
  tracks: readonly ExperienceTrack[];
  copy: SectionCopy;
  ui: UiStrings["experience"];
}

const TRACK_COLORS = ["--band-2", "--band-6"];
/** Areas shown before the "more" fold; the rest are one click away. */
const SHOWN = 3;

function AreaItem({
  area,
  index,
  ui,
}: {
  area: ScopeArea;
  index: number;
  ui: UiStrings["experience"];
}) {
  // On phones the item is one line (number and title) with the detail a
  // tap away; from md up it is always open and reads as before.
  return (
    <li className="border-b border-graticule">
      <PhoneFold
        summaryClassName="grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-2 py-4 sm:grid-cols-[3rem_1fr_auto] md:pt-5 md:pb-0"
        summary={
          <>
            <span
              aria-hidden="true"
              className="index-ink text-sm font-semibold text-ink-soft tabular"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-bold">{area.title}</span>
          </>
        }
      >
        <div className="pb-5 pl-[2.75rem] sm:pl-[3.5rem]">
          <p className="max-w-[40rem] text-ink-soft md:mt-1.5">{area.body}</p>
          {area.impact ? (
            <p className="mt-3 flex max-w-[40rem] gap-3 text-sm">
              <span className="shrink-0 font-semibold text-ink">
                {ui.impact}
              </span>
              <span className="text-ink-soft">{area.impact}</span>
            </p>
          ) : null}
          {area.metric ? (
            <InView className="metric-play mt-4 max-w-[34rem]">
              <MetricBars metrics={[area.metric]} />
            </InView>
          ) : null}
        </div>
      </PhoneFold>
    </li>
  );
}

/**
 * Bodies of work, one after the other. Described by domain and scope,
 * not by employer or dates: what the reader needs is what was owned.
 */
export function Experience({ tracks, copy, ui }: ExperienceProps) {
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
                className="grid gap-8 md:grid-cols-12 md:gap-10"
              >
                <header className="md:col-span-5 md:self-start lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                  <div
                    aria-hidden="true"
                    className="grow-x mb-6 h-1.5 w-24 origin-left"
                    style={{ background: color }}
                  />
                  <h3
                    id={`xp-${track.id}`}
                    className="text-[2rem] leading-[0.95] font-extrabold font-expanded [overflow-wrap:anywhere] sm:text-4xl md:text-5xl"
                  >
                    {track.short}
                  </h3>
                  <p className="mt-4 md:text-lg">{track.domain}</p>
                  {/* Phones: the team and stack context waits in a fold
                      at the end of the track (below). */}
                  <p className="mt-2 hidden text-ink-soft md:block">
                    {track.context}
                  </p>
                  <dl className="mt-6 text-sm">
                    <dt className="text-ink-soft">{ui.role}</dt>
                    <dd className="mt-0.5 text-base font-semibold">
                      {track.role}
                    </dd>
                  </dl>
                </header>

                <div className="md:col-span-7">
                  <p className="max-w-[40rem] leading-relaxed md:text-lg">
                    {track.summary}
                  </p>

                  <h4 className="sr-only">{ui.scope}</h4>
                  <ol className="mt-6 border-t border-graticule md:mt-8">
                    {track.areas.slice(0, SHOWN).map((area, i) => (
                      <AreaItem
                        key={area.title}
                        area={area}
                        index={i}
                        ui={ui}
                      />
                    ))}
                  </ol>
                  {track.areas.length > SHOWN ? (
                    <details className="group/more">
                      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-graticule py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                        {fill(ui.more, { count: track.areas.length - SHOWN })}
                        <span
                          aria-hidden="true"
                          className="text-2xl leading-none font-light text-ink-soft transition-transform duration-300 group-open/more:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <ol start={SHOWN + 1}>
                        {track.areas.slice(SHOWN).map((area, i) => (
                          <AreaItem
                            key={area.title}
                            area={area}
                            index={SHOWN + i}
                            ui={ui}
                          />
                        ))}
                      </ol>
                    </details>
                  ) : null}

                  <div className="mt-6 hidden md:block">
                    <h4 className="text-sm text-ink-soft">{ui.stack}</h4>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {track.stack.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <PhoneFold
                    className="md:hidden"
                    summaryClassName="flex items-center justify-between border-b border-graticule py-4 text-sm font-semibold"
                    summary={ui.teamStack}
                  >
                    <div className="pt-3 pb-2">
                      <p className="text-ink-soft">{track.context}</p>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {track.stack.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </PhoneFold>
                </div>
              </article>
            );
          })}
        </div>

        {earlier.length > 0 ? (
          <div className="mt-20 border-t border-graticule pt-10 md:mt-28">
            <h3 className="text-sm font-semibold text-ink-soft">
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
                  <p className="mt-3 max-w-[36rem] text-ink-soft">
                    {track.summary}
                  </p>
                  {track.areas.length > 0 ? (
                    <PhoneFold
                      className="mt-4"
                      summaryClassName="flex items-center justify-between border-y border-graticule py-3 text-sm font-semibold md:sr-only"
                      summary={
                        <>
                          {fill(ui.highlights, { count: track.areas.length })}
                        </>
                      }
                    >
                      <ul className="mt-4 space-y-2 text-ink-soft">
                        {track.areas.map((area) => (
                          <li key={area.title} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-[0.75em] h-px w-3 shrink-0 bg-coast"
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
                    </PhoneFold>
                  ) : null}
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailShell } from "@/components/layout/detail-shell";
import {
  TRACK_COLORS,
  TrackKicker,
  TrackStats,
} from "@/components/sections/experience";
import { categoryColor } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import { detailMetadata, notFoundMetadata } from "@/lib/detail-metadata";
import { redirectMiscased } from "@/lib/locale-case";
import type { Locale } from "@/content/types";
import { AreaList } from "@/features/experience/area-list";
import { TrackFlowView } from "@/features/experience/track-flow";
import { caseHref } from "@/features/work-log/case-steps";

/** Only the main bodies of work have a page; earlier ones are short. */
const tracksOf = (lang: Locale) =>
  getContent(lang).experience.filter((t) => !t.earlier);

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    tracksOf(lang).map((t) => ({ lang, id: t.id })),
  );
}

function find(lang: string, id: string) {
  if (!isLocale(lang)) return null;
  const tracks = tracksOf(lang);
  const index = tracks.findIndex((t) => t.id === id);
  if (index < 0) return null;
  return { lang, content: getContent(lang), track: tracks[index], index };
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/experience/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const found = find(lang, id);
  if (!found) return notFoundMetadata(lang);
  const { track, content } = found;
  return detailMetadata({
    content,
    path: `/experience/${id}`,
    title: track.short,
    description: track.domain,
    type: "profile",
  });
}

/**
 * One body of work in full: the setting, the role, the summary, the flow
 * drawing, every area of ownership open, the stack, and the cases from it.
 */
export default async function TrackPage({
  params,
}: PageProps<"/[lang]/experience/[id]">) {
  const { lang, id } = await params;
  redirectMiscased(lang, `/experience/${id}`);
  const found = find(lang, id);
  if (!found) notFound();
  const { content: c, track, index } = found;
  const ui = c.ui.experience;
  const cases = c.work.entries.filter((e) => e.track === track.id);
  const other = c.ui.switchLanguage.hrefLang;
  const color = `var(${TRACK_COLORS[index % TRACK_COLORS.length]})`;

  return (
    <DetailShell
      content={c}
      back={{ label: ui.back, href: `/${lang}#xp-${id}` }}
      otherPath={`/${other}/experience/${id}`}
    >
      <article aria-labelledby="track-title">
        <TrackKicker color={color} />
        <h1
          id="track-title"
          className="text-[2.25rem] leading-[0.95] font-extrabold font-expanded md:text-6xl [:lang(zh)_&]:leading-[1.15]"
        >
          {track.short}
        </h1>
        {track.tagline ? (
          <p className="mt-4 max-w-[44rem] md:text-lg">
            {track.tagline}
          </p>
        ) : null}
        <div className="max-w-[36rem]">
          <TrackStats track={track} />
        </div>

        {track.flow ? (
          <div className="mt-14 border-y border-control py-8 md:py-10">
            <TrackFlowView track={track} flow={track.flow} ui={ui} />
          </div>
        ) : null}

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,38rem)_1fr_19rem] lg:gap-x-10">
          <div>
            <div className="space-y-4 md:text-lg">
              <p>{track.domain}</p>
              <p>{track.context}</p>
            </div>
            <dl className="mt-8 grid gap-1">
              <dt className="coord">{ui.role}</dt>
              <dd className="font-semibold">{track.role}</dd>
            </dl>
            <p className="mt-8 leading-relaxed">{track.summary}</p>

            <h2 className="mt-14 mb-3 flex items-center gap-3 text-lg font-bold after:h-px after:flex-1 after:bg-graticule">
              {ui.scope}
            </h2>
            <AreaList track={track} ui={ui} open />
          </div>

          <aside className="space-y-10 lg:sticky lg:top-8 lg:col-start-3 lg:self-start">
            <div className="space-y-2">
              <h2 className="coord">{ui.stack}</h2>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                {track.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            {cases.length > 0 ? (
              <div>
                <h2 className="coord">{c.sections.work.label}</h2>
                <ul className="mt-3 border-t border-control">
                  {cases.map((e) => (
                    <li key={e.id} className="border-b border-graticule">
                      <a
                        href={caseHref(lang as Locale, e.id)}
                        className="pen-row flex items-start gap-3 py-3.5 text-sm font-semibold hover:text-ink-soft"
                      >
                        <span
                          aria-hidden="true"
                          className="mark mt-[0.45em]"
                          style={{
                            background: `var(${categoryColor[e.category]})`,
                          }}
                        />
                        <span className="flex-1 text-balance">{e.title}</span>
                        <span aria-hidden="true" className="text-ink-soft">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </DetailShell>
  );
}

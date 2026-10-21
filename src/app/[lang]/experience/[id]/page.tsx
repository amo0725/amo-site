import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailShell } from "@/components/layout/detail-shell";
import { TRACK_COLORS, TrackStats } from "@/components/sections/experience";
import { getContent, isLocale, locales } from "@/content";
import { detailMetadata } from "@/lib/detail-metadata";
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
  if (!found) return {};
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
      back={{ label: c.sections.experience.label, href: `/${lang}#xp-${id}` }}
      otherPath={`/${other}/experience/${id}`}
    >
      <article aria-labelledby="track-title">
        <div
          aria-hidden="true"
          className="mb-6 h-1.5 w-24"
          style={{ background: color }}
        />
        <h1
          id="track-title"
          className="text-[2.25rem] leading-[0.95] font-extrabold font-expanded md:text-6xl"
        >
          {track.short}
        </h1>
        {track.tagline ? (
          <p className="mt-4 text-ink-soft md:text-lg">{track.tagline}</p>
        ) : null}
        <div className="max-w-[34rem]">
          <TrackStats track={track} />
        </div>

        <div className="mt-10 max-w-[44rem] space-y-4 md:text-lg">
          <p>{track.domain}</p>
          <p className="text-ink-soft">{track.context}</p>
        </div>
        <dl className="mt-6 max-w-[44rem]">
          <dt className="text-sm text-ink-soft">{ui.role}</dt>
          <dd className="mt-0.5 font-semibold">{track.role}</dd>
        </dl>
        <p className="mt-6 max-w-[44rem] leading-relaxed">{track.summary}</p>

        {track.flow ? (
          <div className="mt-12">
            <TrackFlowView track={track} flow={track.flow} ui={ui} />
          </div>
        ) : null}

        <h2 className="mt-14 mb-2 text-xl font-bold">{ui.scope}</h2>
        <AreaList track={track} ui={ui} open />

        <h2 className="mt-12 text-sm text-ink-soft">{ui.stack}</h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {track.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        {cases.length > 0 ? (
          <>
            <h2 className="mt-14 text-xl font-bold">
              {c.sections.work.label}
            </h2>
            <ul className="mt-4 border-t border-graticule">
              {cases.map((e) => (
                <li key={e.id} className="border-b border-graticule">
                  <a
                    href={caseHref(lang as Locale, e.id)}
                    className="flex items-baseline justify-between gap-4 py-4 font-semibold hover:text-ink-soft"
                  >
                    {e.title}
                    <span aria-hidden="true" className="text-ink-soft">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </article>
    </DetailShell>
  );
}

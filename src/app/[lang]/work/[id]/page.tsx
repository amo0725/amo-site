import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailShell } from "@/components/layout/detail-shell";
import { categoryColor, site } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import type { Locale } from "@/content/types";
import { CaseBody } from "@/features/work-log/case-body";
import {
  caseAnchor,
  caseHref,
  CaseSteps,
} from "@/features/work-log/case-steps";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getContent(lang).work.entries.map((e) => ({ lang, id: e.id })),
  );
}

function find(lang: string, id: string) {
  if (!isLocale(lang)) return null;
  const content = getContent(lang);
  const index = content.work.entries.findIndex((e) => e.id === id);
  if (index < 0) return null;
  return { lang, content, index, entry: content.work.entries[index] };
}

const paths = (id: string) =>
  Object.fromEntries(locales.map((l) => [l, `/${l}/work/${id}`])) as Record<
    Locale,
    string
  >;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/work/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const found = find(lang, id);
  if (!found) return {};
  const { entry } = found;
  const description =
    lang === "en"
      ? `${entry.steps.symptom}. ${entry.steps.result}.`
      : `${entry.steps.symptom}。${entry.steps.result}。`;
  return {
    title: entry.title,
    description,
    alternates: {
      canonical: paths(id)[lang as Locale],
      languages: paths(id),
    },
    openGraph: { type: "article", url: paths(id)[lang as Locale], title: entry.title },
  };
}

/**
 * One case from the work log, in full: the four steps first, then the
 * whole write-up. Reached from "read the full case" in the list, or a
 * shared link; "back" returns to the case in the list.
 */
export default async function CasePage({
  params,
}: PageProps<"/[lang]/work/[id]">) {
  const { lang, id } = await params;
  const found = find(lang, id);
  if (!found) notFound();
  const { content: c, entry, index } = found;
  const ui = c.ui.work;
  const entries = c.work.entries;
  const prev = entries[index - 1];
  const next = entries[index + 1];
  const track = c.experience.find((t) => t.id === entry.track);
  const other = c.ui.switchLanguage.hrefLang;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    inLanguage: c.htmlLang,
    author: { "@type": "Person", name: c.profile.fullName, url: `${site.url}/${lang}` },
    url: `${site.url}/${lang}/work/${id}`,
  };

  return (
    <DetailShell
      content={c}
      back={{ label: ui.back, href: `/${lang}#${caseAnchor(id)}` }}
      otherPath={`/${other}/work/${id}`}
    >
      <article aria-labelledby="case-title">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2.5"
              style={{ background: `var(${categoryColor[entry.category]})` }}
            />
            {c.work.categories[entry.category]}
          </span>
          {track ? <span>{track.short}</span> : null}
        </p>
        <h1
          id="case-title"
          className="mt-3 text-[1.75rem] leading-tight font-extrabold text-balance md:text-4xl"
        >
          {entry.title}
        </h1>

        <div className="mt-8 border-y border-graticule py-6 md:mt-10 md:py-8">
          <CaseSteps entry={entry} ui={ui} heading="h2" />
        </div>

        <div className="mt-10 md:mt-14">
          <CaseBody entry={entry} ui={ui} />
        </div>
      </article>

      <nav
        aria-label={c.sections.work.label}
        className="mt-16 grid gap-3 border-t border-graticule pt-6 sm:grid-cols-2"
      >
        {prev ? (
          <a
            href={caseHref(lang as Locale, prev.id)}
            className="grid gap-1 border border-graticule p-4 hover:border-control"
          >
            <span className="text-xs text-ink-soft">← {ui.prev}</span>
            <span className="font-semibold">{prev.title}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a
            href={caseHref(lang as Locale, next.id)}
            className="grid gap-1 border border-graticule p-4 text-right hover:border-control"
          >
            <span className="text-xs text-ink-soft">{ui.next} →</span>
            <span className="font-semibold">{next.title}</span>
          </a>
        ) : null}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </DetailShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailShell } from "@/components/layout/detail-shell";
import { InView } from "@/components/motion/in-view";
import { categoryColor, site } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import { detailMetadata } from "@/lib/detail-metadata";
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

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/work/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const found = find(lang, id);
  if (!found) return {};
  const { entry, content } = found;
  const description =
    lang === "en"
      ? `${entry.steps.symptom}. ${entry.steps.result}.`
      : `${entry.steps.symptom}。${entry.steps.result}。`;
  return detailMetadata({
    content,
    path: `/work/${id}`,
    title: entry.title,
    description,
  });
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
    author: {
      "@type": "Person",
      name: c.profile.fullName,
      url: `${site.url}/${lang}`,
    },
    url: `${site.url}/${lang}/work/${id}`,
  };

  const color = `var(${categoryColor[entry.category]})`;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <DetailShell
      content={c}
      back={{ label: ui.back, href: `/${lang}#${caseAnchor(id)}` }}
      otherPath={`/${other}/work/${id}`}
    >
      <article aria-labelledby="case-title">
        <span
          aria-hidden="true"
          className="grow-x block h-0.5 w-24 origin-left"
          style={{ background: color }}
        />
        <p className="coord mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="mark"
              style={{ background: color }}
            />
            {c.work.categories[entry.category]}
          </span>
          {track ? <span>{track.short}</span> : null}
          <span className="tabular">
            {pad(index + 1)} / {pad(entries.length)}
          </span>
        </p>
        <h1
          id="case-title"
          className="mt-3 max-w-[22em] text-[1.75rem] leading-[1.1] font-extrabold text-balance md:text-4xl lg:text-[2.75rem] [:lang(zh)_&]:leading-[1.25]"
        >
          {entry.title}
        </h1>

        <InView threshold={0.3}>
          <div className="mt-10 border-y border-control py-7 md:mt-12 md:py-9">
            <h2 className="sr-only">{ui.summary}</h2>
            <CaseSteps entry={entry} ui={ui} heading="h3" />
          </div>
        </InView>

        <div className="mt-12 md:mt-16">
          <CaseBody entry={entry} ui={ui} />
        </div>
      </article>

      <nav
        aria-label={c.sections.work.label}
        className="mt-20 grid border-t border-control sm:grid-cols-2 sm:gap-x-10"
      >
        {prev ? (
          <a
            href={caseHref(lang as Locale, prev.id)}
            className="pen-row grid gap-1.5 border-b border-graticule py-5"
          >
            <span className="coord">
              ← {ui.prev} · {pad(index)}
            </span>
            <span className="font-semibold text-balance">{prev.title}</span>
          </a>
        ) : (
          <span aria-hidden="true" />
        )}
        {next ? (
          <a
            href={caseHref(lang as Locale, next.id)}
            className="pen-row grid gap-1.5 border-b border-graticule py-5"
          >
            <span className="coord">
              {ui.next} · {pad(index + 2)} →
            </span>
            <span className="font-semibold text-balance">{next.title}</span>
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

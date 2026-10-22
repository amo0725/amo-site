import { DetailShell } from "@/components/layout/detail-shell";
import type { SiteContent } from "@/content/types";

/**
 * The site's 404, in the reader's language, inside the detail frame (name,
 * the other language, contact): three ways on instead of a dead end.
 */
export function NotFoundView({ content: c }: { content: SiteContent }) {
  const t = c.ui.notFound;
  const home = `/${c.locale}`;
  const other = c.ui.switchLanguage.hrefLang;
  return (
    <DetailShell
      content={c}
      back={{ label: t.home, href: home }}
      otherPath={`/${other}`}
    >
      <div className="grid gap-10 py-6 md:py-12 lg:grid-cols-12">
        <p
          aria-hidden="true"
          className="text-[clamp(5rem,22vw,13rem)] leading-[0.8] font-extrabold tabular font-expanded lg:col-span-5"
        >
          404
        </p>
        <div className="lg:col-span-7 lg:self-end">
          <h1 className="text-[1.75rem] leading-[1.15] font-extrabold text-balance md:text-4xl [:lang(zh)_&]:leading-[1.3]">
            <span className="sr-only">404 · </span>
            {t.title}
          </h1>
          <p className="mt-3 text-ink-soft md:text-lg">{t.body}</p>
          <p className="mt-8 max-w-[36rem]">{t.hint}</p>
          <ul className="mt-6 grid gap-3 border-t border-graticule pt-5">
            <li>
              <a href={`${home}#work`} className="go">
                {t.cases}
              </a>
            </li>
            <li>
              <a href={home} className="go">
                {t.home}
              </a>
            </li>
            <li>
              <a href={`${home}#contact`} className="go">
                {t.contact}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </DetailShell>
  );
}

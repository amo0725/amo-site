import type { ReactNode } from "react";
import type { Locale, SiteContent } from "@/content/types";
import { SiteFooter } from "./site-footer";

interface DetailShellProps {
  content: SiteContent;
  /** Where "back" goes: the home page, at the item this page expands. */
  back: { label: string; href: string };
  /** This page's path in the other language. */
  otherPath: string;
  children: ReactNode;
}

/**
 * The frame of a page that expands one item from the home page (a case, a
 * body of work): a quiet bar with the way back and the other language, the
 * article, and the site footer. No section navigation: the way out is back
 * to where the reader came from.
 *
 * Links between the home page and these pages are plain anchors (full
 * loads): the smooth-scroll instance and AnchorSettle live in the shared
 * layout and only settle a #target on a fresh load, which is what "back to
 * this case" needs.
 */
export function DetailShell({
  content,
  back,
  otherPath,
  children,
}: DetailShellProps) {
  const { profile, ui } = content;
  const other: Locale = ui.switchLanguage.hrefLang;
  return (
    <>
      <div id="top" />
      <header className="border-b border-graticule px-5 md:px-10">
        <div className="mx-auto flex h-[var(--header-h)] max-w-[90rem] items-center justify-between gap-4">
          <a
            href={back.href}
            className="flex min-h-10 items-center gap-2 text-sm font-semibold"
          >
            <span aria-hidden="true">←</span>
            {back.label}
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={`/${content.locale}`}
              className="hidden font-extrabold font-expanded sm:inline"
            >
              {profile.name}
            </a>
            <a
              href={otherPath}
              hrefLang={other}
              lang={other}
              className="flex min-h-10 items-center rounded-full border border-control px-3 font-semibold hover:border-ink"
            >
              {ui.switchLanguage.label}
            </a>
          </div>
        </div>
      </header>
      <main id="main" className="px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto max-w-[60rem]">{children}</div>
      </main>
      <SiteFooter profile={profile} ui={ui.footer} />
    </>
  );
}

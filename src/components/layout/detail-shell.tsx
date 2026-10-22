import type { ReactNode } from "react";
import type { Locale, SiteContent } from "@/content/types";
import { ContactStrip } from "./contact-strip";
import { DetailHeader } from "./detail-header";
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
 * body of work): a bar with the way back, the author and the other
 * language; the article; a closing contact strip and the site footer. No
 * section navigation: the way out is back to where the reader came from,
 * or straight to getting in touch.
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
      <DetailHeader
        back={back}
        home={`/${content.locale}`}
        name={profile.fullName}
        role={profile.role}
        language={{
          label: ui.switchLanguage.label,
          href: otherPath,
          hrefLang: other,
        }}
        backToTop={ui.footer.backToTop}
      />
      <main
        id="main"
        tabIndex={-1}
        className="px-5 py-12 outline-none md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-[90rem]">{children}</div>
      </main>
      <ContactStrip content={content} />
      <SiteFooter profile={profile} ui={ui.footer} />
    </>
  );
}

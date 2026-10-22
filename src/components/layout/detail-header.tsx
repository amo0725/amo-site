"use client";

import type { Locale } from "@/content/types";
import { cn } from "@/lib/cn";
import { useReturningHeader } from "@/lib/hooks/use-returning-header";
import { BackToTop } from "./back-to-top";

interface DetailHeaderProps {
  back: { label: string; href: string };
  home: string;
  name: string;
  role: string;
  language: { label: string; href: string; hrefLang: Locale };
  backToTop: string;
}

/**
 * "Back" as the browser's Back when the reader came here from the home
 * page: the page returns from the back/forward cache exactly as it was
 * left (scroll position, open cases), instead of loading again. Otherwise
 * (a shared link, a neighbouring case) the link goes to its href.
 */
const goBack =
  (home: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    try {
      const from = new URL(document.referrer);
      if (
        from.origin === window.location.origin &&
        from.pathname === home &&
        window.history.length > 1
      ) {
        e.preventDefault();
        window.history.back();
      }
    } catch {
      // No referrer: follow the link.
    }
  };

/**
 * The bar of a detail page: the way back, who wrote this (the page is often
 * the first one a shared link opens), and the other language. Like the
 * home page's header it steps aside while reading down and returns on the
 * first scroll up, so "back" is never more than a flick away.
 */
export function DetailHeader({
  back,
  home,
  name,
  role,
  language,
  backToTop,
}: DetailHeaderProps) {
  const { hidden, far } = useReturningHeader();
  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-graticule bg-paper px-5 transition-[translate] duration-300 ease-[var(--ease-out-expo)] md:px-10",
          hidden && "-translate-y-full focus-within:translate-y-0",
        )}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[90rem] items-center justify-between gap-3">
          <a href={back.href} onClick={goBack(home)} className="go go-back min-w-0">
            <span className="min-w-0 truncate">{back.label}</span>
          </a>
          <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <a
              href={home}
              className="flex min-h-11 items-center gap-2 whitespace-nowrap"
            >
              <span className="font-extrabold font-name font-expanded">{name}</span>
              <span className="hidden text-ink-soft md:inline">· {role}</span>
            </a>
            <a
              href={language.href}
              hrefLang={language.hrefLang}
              lang={language.hrefLang}
              className="flex min-h-10 items-center rounded-[2px] border border-control px-3 font-semibold hover:border-ink"
            >
              {language.label}
            </a>
          </div>
        </div>
      </header>
      <BackToTop label={backToTop} shown={far && !hidden} />
    </>
  );
}

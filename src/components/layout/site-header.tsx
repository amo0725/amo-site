"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { MotionToggle } from "@/components/ui/motion-toggle";
import type { Locale } from "@/content/types";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import { useReturningHeader } from "@/lib/hooks/use-returning-header";
import type { NavItem } from "./nav-item";

/**
 * The finest place the reader is at, for the language switch: an open case
 * or area of ownership, or the body of work, crossing the reading line;
 * otherwise the section. The other language has the same ids.
 */
function readingAnchor(section: string | null): string | null {
  const line = window.innerHeight * 0.475;
  const crosses = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.top <= line && r.bottom >= line;
  };
  const pick = (selector: string) =>
    [...document.querySelectorAll<HTMLElement>(selector)].find(crosses);
  const open =
    pick("#work details.log-entry[open]") ??
    pick("#experience li.area-item:has(details[open])");
  if (open?.id) return open.id;
  const track = pick('#experience article[aria-labelledby^="xp-"]');
  return track?.getAttribute("aria-labelledby") ?? section;
}

interface SiteHeaderProps {
  name: string;
  nav: readonly NavItem[];
  navLabel: string;
  menu: { open: string; close: string; current: string };
  motion: { label: string; on: string; off: string };
  language: { label: string; href: string; hrefLang: Locale };
  /** Name of the wordmark link once it leads back to the top. */
  backToTop: string;
}

/**
 * Fixed header that steps aside while reading down and returns when
 * scrolling up. Below the desktop breakpoint the section links live in a
 * disclosure menu, so phones get the same map of the page as desktops.
 */
export function SiteHeader({
  name,
  nav,
  navLabel,
  menu,
  motion,
  language,
  backToTop,
}: SiteHeaderProps) {
  const { hidden, scrolled, far } = useReturningHeader();
  const [open, setOpen] = useState(false);
  const active = useActiveSection(nav);
  const current = nav.find((s) => s.id === active);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Set as the link is about to be used (pointer, focus, click), so a
  // copied or middle-clicked link carries the place too.
  const carryPlace = (e: SyntheticEvent<HTMLAnchorElement>) => {
    const anchor = readingAnchor(active);
    e.currentTarget.href = `${language.href}${window.location.search}${
      anchor ? `#${anchor}` : ""
    }`;
  };

  useEffect(() => {
    if (!open) return;
    // Escape from inside the menu hands focus back to its button.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const inMenu = document
        .getElementById("section-menu")
        ?.contains(document.activeElement);
      setOpen(false);
      if (inMenu) menuButton.current?.focus();
    };
    const onWide = () => {
      if (window.matchMedia("(min-width: 80rem)").matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWide);
    };
  }, [open]);

  return (
    <header
      // Tabbing out of the open menu closes it, so focus never sits on the
      // page behind the scrim.
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null))
          setOpen(false);
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
        hidden && !open && "-translate-y-full focus-within:translate-y-0",
        (scrolled || open) && "bg-paper shadow-[0_1px_0_var(--graticule)]",
      )}
    >
      {/* Scrim under the open menu: dims the page and closes on a tap.
          Before the nav, so the menu panel paints over it. */}
      <div
        aria-hidden="true"
        hidden={!open}
        onClick={() => setOpen(false)}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 bg-paper/70 backdrop-blur-[2px] xl:hidden"
      />
      <nav
        aria-label={navLabel}
        className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-6 px-5 md:px-10"
      >
        {/* The wordmark is the way back to the top. Far down the page (when
            the header comes back on a scroll up) it says so with an arrow,
            instead of a floating button laid over the text. */}
        <a
          href="#top"
          aria-label={far ? `${backToTop}: ${name}` : undefined}
          className="inline-flex min-h-11 items-center gap-1.5 text-lg font-extrabold tracking-tight font-name font-expanded"
        >
          {far ? (
            <span aria-hidden="true" className="text-base text-ink-soft">
              ↑
            </span>
          ) : null}
          {name}
        </a>
        <ul className="hidden items-center gap-6 text-sm xl:flex">
          {nav.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "relative -mx-1 px-1 py-2 whitespace-nowrap transition-colors",
                  active === s.id ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {s.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left transition-transform duration-300",
                    active === s.id ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ background: `var(${s.colorVar})` }}
                />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {/* Below xl the switch lives in the menu panel, which leaves the
              bar room to name the section being read. The section links
              need the full width of xl to stay on one line with the
              reader's own text spacing (WCAG 1.4.12). */}
          <span className="hidden xl:contents">
            <MotionToggle
              label={motion.label}
              on={motion.on}
              off={motion.off}
              compact
              tall
            />
          </span>
          {/* Phones have no side legend, so the menu button doubles as the
              "you are here": the current section's swatch and name. */}
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="section-menu"
            aria-label={
              open
                ? menu.close
                : current
                  ? menu.current.replace("{section}", current.label)
                  : menu.open
            }
            onClick={() => setOpen((o) => !o)}
            // Drawn at 28px, but the ::before stretches the tap target to 44.
            className="relative inline-flex items-center gap-2 py-1 before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] rounded-full border border-control px-3 font-semibold whitespace-nowrap transition-colors hover:border-ink xl:hidden"
          >
            {!open && current ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0"
                  style={{ background: `var(${current.colorVar})` }}
                />
                {current.label}
                <span aria-hidden="true" className="text-ink-soft">
                  ▾
                </span>
              </>
            ) : open ? (
              menu.close
            ) : (
              menu.open
            )}
          </button>
          {/* The menu panel sits right after its button, inside the nav
              landmark, so the tab order runs button, sections, motion,
              language. The fixed header is still its containing block. */}
          <div
            id="section-menu"
            // Focusable, so a tap on the panel's own padding keeps focus in
            // the header and doesn't count as leaving the menu.
            tabIndex={-1}
            hidden={!open}
            className="absolute inset-x-0 top-full border-b border-graticule bg-paper px-5 pt-2 pb-6 outline-none md:px-10 xl:hidden"
          >
            <ul className="mx-auto grid max-w-[90rem] gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {nav.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === s.id ? "location" : undefined}
                    className={cn(
                      "flex items-center gap-3 border-b border-graticule py-3 text-lg",
                      active === s.id && "font-semibold",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-3.5 shrink-0 transition-[width]",
                        active === s.id ? "w-3" : "w-1.5",
                      )}
                      style={{ background: `var(${s.colorVar})` }}
                    />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mx-auto mt-4 flex max-w-[90rem] justify-end">
              <MotionToggle
                label={motion.label}
                on={motion.on}
                off={motion.off}
                tall
              />
            </div>
          </div>

          {/* Carries where the reader is (the section, or an open case or
              area, and the filters), so switching language mid-read lands
              on the same place. */}
          <a
            href={active ? `${language.href}#${active}` : language.href}
            onPointerEnter={carryPlace}
            onFocus={carryPlace}
            onClick={carryPlace}
            hrefLang={language.hrefLang}
            lang={language.hrefLang}
            className="relative py-1 before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] rounded-full border border-control px-3 font-semibold whitespace-nowrap transition-colors hover:border-ink"
          >
            {language.label}
          </a>
        </div>
      </nav>
    </header>
  );
}

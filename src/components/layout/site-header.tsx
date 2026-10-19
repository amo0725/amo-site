"use client";

import { useEffect, useState } from "react";
import { MotionToggle } from "@/components/ui/motion-toggle";
import type { Locale } from "@/content/types";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import type { NavItem } from "./nav-item";

interface SiteHeaderProps {
  name: string;
  nav: readonly NavItem[];
  navLabel: string;
  menu: { open: string; close: string };
  motion: { label: string; on: string; off: string };
  language: { label: string; href: string; hrefLang: Locale };
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
}: SiteHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(nav);
  const current = nav.find((s) => s.id === active);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 240);
          last = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Lets pinned elements (an open case's title) sit under the header, or
  // at the top edge while the header is away.
  useEffect(() => {
    document.documentElement.toggleAttribute(
      "data-header-hidden",
      hidden && !open,
    );
  }, [hidden, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onWide = () => {
      if (window.matchMedia("(min-width: 64rem)").matches) setOpen(false);
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
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
        hidden && !open && "-translate-y-full focus-within:translate-y-0",
        (scrolled || open) && "bg-paper shadow-[0_1px_0_var(--graticule)]",
      )}
    >
      <nav
        aria-label={navLabel}
        className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-6 px-5 md:px-10"
      >
        <a
          href="#top"
          className="text-lg font-extrabold tracking-tight font-expanded"
        >
          {name}
        </a>
        <ul className="hidden items-center gap-5 text-sm lg:flex xl:gap-6">
          {nav.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "relative py-1 whitespace-nowrap transition-colors",
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
          {/* Below lg the switch lives in the menu panel, which leaves the
              bar room to name the section being read. */}
          <span className="hidden lg:contents">
            <MotionToggle
              label={motion.label}
              on={motion.on}
              off={motion.off}
              compact
            />
          </span>
          {/* Phones have no side legend, so the menu button doubles as the
              "you are here": the current section's swatch and name. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="section-menu"
            aria-label={
              open
                ? menu.close
                : current
                  ? `${menu.open}: ${current.label}`
                  : menu.open
            }
            onClick={() => setOpen((o) => !o)}
            // Drawn at 28px, but the ::before stretches the tap target to 44.
            className="relative inline-flex items-center gap-2 py-1 before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] rounded-full border border-control px-3 font-semibold whitespace-nowrap transition-colors hover:border-ink lg:hidden"
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
          {/* Carries the current section, so switching language mid-read
              lands on the same part of the page. */}
          <a
            href={active ? `${language.href}#${active}` : language.href}
            hrefLang={language.hrefLang}
            lang={language.hrefLang}
            className="relative py-1 before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] rounded-full border border-control px-3 font-semibold whitespace-nowrap transition-colors hover:border-ink"
          >
            {language.label}
          </a>
        </div>
      </nav>

      {/* Scrim under the open menu: dims the page and closes on a tap. */}
      <div
        aria-hidden="true"
        hidden={!open}
        onClick={() => setOpen(false)}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 bg-paper/70 backdrop-blur-[2px] lg:hidden"
      />
      <div
        id="section-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-graticule bg-paper px-5 pt-2 pb-6 md:px-10 lg:hidden"
      >
        <ul className="mx-auto grid max-w-[90rem] gap-x-8 sm:grid-cols-2">
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
          <MotionToggle label={motion.label} on={motion.on} off={motion.off} />
        </div>
      </div>
    </header>
  );
}

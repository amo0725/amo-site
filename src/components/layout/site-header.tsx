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
          <MotionToggle
            label={motion.label}
            on={motion.on}
            off={motion.off}
            compact
          />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="section-menu"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-coast px-3 py-0.5 font-semibold transition-colors hover:border-ink lg:hidden"
          >
            {open ? menu.close : menu.open}
          </button>
          <a
            href={language.href}
            hrefLang={language.hrefLang}
            lang={language.hrefLang}
            className="rounded-full border border-coast px-3 py-0.5 font-semibold transition-colors hover:border-ink"
          >
            {language.label}
          </a>
        </div>
      </nav>

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
                className="flex items-center gap-3 border-b border-graticule py-3 text-lg"
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-1.5 shrink-0"
                  style={{ background: `var(${s.colorVar})` }}
                />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

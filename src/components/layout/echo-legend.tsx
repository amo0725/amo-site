"use client";

import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import type { NavItem } from "./nav-item";

/**
 * Side navigation drawn as a radar reflectivity legend. Each band is a
 * section; the thin line beside it fills with scroll progress.
 */
export function EchoLegend({
  nav,
  label,
}: {
  nav: readonly NavItem[];
  label: string;
}) {
  const active = useActiveSection(nav);

  return (
    <nav
      aria-label={label}
      className={cn(
        "fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 transition-opacity duration-500 2xl:block",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex gap-2">
        <span aria-hidden="true" className="relative w-px bg-graticule">
          <span className="scroll-progress absolute inset-0 bg-ink" />
        </span>
        <ul className="flex flex-col">
          {nav.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  className="group flex h-7 items-center justify-end gap-3"
                >
                  <span
                    className={cn(
                      "translate-x-2 rounded bg-paper/90 px-1.5 text-xs whitespace-nowrap opacity-0 transition-[opacity,transform] duration-300",
                      "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                      on && "font-semibold",
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-full transition-[width] duration-300 ease-[var(--ease-out-expo)]",
                      on ? "w-3" : "w-1.5",
                    )}
                    style={{ background: `var(${s.colorVar})` }}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

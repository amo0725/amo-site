"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useIsPhone } from "@/lib/hooks/use-is-phone";

interface PhoneFoldProps {
  /** Always-visible line: a toggle on phones, a plain heading from md up. */
  summary: ReactNode;
  summaryClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Progressive disclosure for phones. Served open (desktops, no-JS visitors
 * and crawlers read everything); on a phone-width screen it closes after
 * hydration, so the reader sees one line per item with the detail a tap
 * away. Always below the first screen, so nothing in view moves.
 */
export function PhoneFold({
  summary,
  summaryClassName,
  className,
  children,
}: PhoneFoldProps) {
  const phone = useIsPhone();
  // What the reader chose on a phone; wide screens are always open.
  const [opened, setOpened] = useState(false);
  return (
    <details
      className={cn("phone-fold", className)}
      open={phone ? opened : true}
      onToggle={(e) => {
        const d = e.currentTarget;
        if (phone) setOpened(d.open);
        else if (!d.open) d.open = true;
      }}
    >
      <summary className={summaryClassName} tabIndex={phone ? 0 : -1}>
        {summary}
        <span
          aria-hidden="true"
          className="fold-icon text-2xl leading-none font-light text-ink-soft"
        >
          +
        </span>
      </summary>
      {children}
    </details>
  );
}

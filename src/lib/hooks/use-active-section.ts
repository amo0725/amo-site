"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section crossing the middle of the viewport, or
 * null above the first one (the hero).
 *
 * Measured on scroll rather than with an IntersectionObserver set up once:
 * sections stream in after hydration (inside hidden Suspense holders), so
 * an observer created on mount could miss them and stay on null. Elements
 * are looked up on every frame. Between listed sections (the reel is not in
 * the nav) the last section read stays current, so labels don't flicker.
 */
export function useActiveSection(
  items: ReadonlyArray<{ id: string }>,
): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.475;
      let found: string | null = null;
      let firstTop = Number.POSITIVE_INFINITY;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el || el.closest("[hidden]")) continue;
        const r = el.getBoundingClientRect();
        firstTop = Math.min(firstTop, r.top);
        if (r.top <= line && r.bottom > line) {
          found = id;
          break;
        }
      }
      setActive((prev) => found ?? (firstTop > line ? null : prev));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}

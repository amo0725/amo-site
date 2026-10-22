"use client";

import { useEffect, useState } from "react";

export interface ReturningHeader {
  /** Reading down: the header steps aside. */
  hidden: boolean;
  /** Past the first few pixels: the bar gets its background. */
  scrolled: boolean;
  /** More than three screens down: a way back to the top is worth showing. */
  far: boolean;
}

const INITIAL: ReturningHeader = { hidden: false, scrolled: false, far: false };

/**
 * A partially persistent header: it steps aside while the reader scrolls
 * down and comes back on the first scroll up (NN/g's pattern for long
 * pages), measured once per frame.
 */
export function useReturningHeader(): ReturningHeader {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    // Scrolling the page does not hide the header until the reader has
    // moved it themselves: a landing on a #link (or a restored position)
    // must not arrive with the header gone and its space left empty.
    let armed = false;
    const arm = () => {
      armed = true;
    };
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) =>
      window.addEventListener(type, arm, { passive: true, once: true }),
    );
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        let hidden: boolean | null = null;
        if (Math.abs(y - last) > 6) {
          hidden = armed && y > last && y > 240;
          last = y;
        }
        const scrolled = y > 24;
        const far = y > window.innerHeight * 3;
        setState((prev) => {
          const next = { hidden: hidden ?? prev.hidden, scrolled, far };
          return next.hidden === prev.hidden &&
            next.scrolled === prev.scrolled &&
            next.far === prev.far
            ? prev
            : next;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      inputs.forEach((type) => window.removeEventListener(type, arm));
      cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}

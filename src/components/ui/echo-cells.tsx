"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPreference } from "@/lib/motion/preference";

/**
 * The cells of one echo bar. At rest the bar is a single element painted
 * with a CSS pattern (see .echo-track), which looks the same as the cells'
 * end state; the 48 cells that play the animation are only created once
 * the bar comes near the screen. Twelve cases' worth of bars would
 * otherwise be over 600 elements in the page from the first load.
 */
export function EchoCells({ cells, keep }: { cells: number; keep: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const reduced = useMotionPreference() === "reduced";

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="echo-track mt-2 flex h-2 gap-[2px]"
      style={{ "--keep": keep, "--cells": cells } as CSSProperties}
    >
      {live
        ? Array.from({ length: cells }, (_, i) => (
            <span
              key={i}
              className={`echo-cell flex-1 ${i < keep ? "echo-keep" : "echo-drop"}`}
              style={{ "--i": i, "--j": cells - 1 - i } as CSSProperties}
            />
          ))
        : null}
    </span>
  );
}

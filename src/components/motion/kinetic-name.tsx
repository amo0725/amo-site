"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/lib/motion/preference";

interface KineticNameProps {
  text: string;
  className?: string;
}

const BASE_STRETCH = 125;
const BASE_WEIGHT = 800;

/**
 * The hero name. Server-rendered as plain letters (the LCP element); on
 * mouse devices each letter then responds to the pointer through the
 * font's width and weight axes: letters near the cursor pull in narrow
 * and heavy, like a squall line passing over them.
 *
 * Each letter sits in a drift wrapper that lifts away on scroll (CSS).
 */
export function KineticName({ text, className }: KineticNameProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const preference = useMotionPreference();
  const letters = Array.from(text);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || preference === "reduced") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const spans = Array.from(
      root.querySelectorAll<HTMLSpanElement>("[data-letter]"),
    );
    const state = spans.map(() => ({
      stretch: BASE_STRETCH,
      weight: BASE_WEIGHT,
    }));
    const pointer = { x: -1e4, y: -1e4 };
    let frame = 0;
    let running = false;

    const step = () => {
      const size = parseFloat(getComputedStyle(root).fontSize) || 200;
      const radius = size * 0.75;
      // Read every rect first, then write, so the loop never thrashes layout.
      const rects = spans.map((s) => s.getBoundingClientRect());
      let moving = false;
      rects.forEach((r, i) => {
        const dx = pointer.x - (r.left + r.width / 2);
        const dy = pointer.y - (r.top + r.height / 2);
        const pull = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        const targetStretch = BASE_STRETCH - pull * 58;
        const targetWeight = BASE_WEIGHT + pull * 100;
        const s = state[i];
        s.stretch += (targetStretch - s.stretch) * 0.14;
        s.weight += (targetWeight - s.weight) * 0.14;
        if (Math.abs(targetStretch - s.stretch) > 0.1) moving = true;
      });
      spans.forEach((span, i) => {
        span.style.setProperty("--stretch", `${state[i].stretch.toFixed(2)}%`);
        span.style.setProperty("--weight", state[i].weight.toFixed(0));
      });
      if (moving) frame = requestAnimationFrame(step);
      else running = false;
    };

    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const section = root.closest("section") ?? root;
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      kick();
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
      kick();
    };
    section.addEventListener("pointermove", onMove as EventListener, {
      passive: true,
    });
    section.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
      spans.forEach((span) => {
        span.style.removeProperty("--stretch");
        span.style.removeProperty("--weight");
      });
    };
  }, [preference]);

  return (
    <span ref={rootRef} aria-hidden="true" className={className}>
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className="name-drift inline-block"
          style={{ "--i": i } as React.CSSProperties}
        >
          <span
            data-letter
            className="name-letter name-rise inline-block"
            style={{ "--i": i } as React.CSSProperties}
          >
            {letter}
          </span>
        </span>
      ))}
    </span>
  );
}

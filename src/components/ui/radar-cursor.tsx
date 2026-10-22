"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/lib/motion/preference";

const INTERACTIVE =
  "a[href], button, summary, [role='button'], input, select, textarea, label";
const RING_IDLE = 34;

/**
 * Radar-style cursor companion for mouse users. The native cursor stays;
 * a range ring trails it and locks onto links and buttons as a target
 * box. Its centre is the signal green that runs through the whole site.
 * No text readout: the box already says what is locked. Everything is
 * written straight to the DOM in one rAF loop that stops once settled.
 */
export function RadarCursor() {
  const preference = useMotionPreference();
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || preference === "reduced") return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const pointer = { x: -100, y: -100, seen: false };
    const box = { x: -100, y: -100, w: RING_IDLE, h: RING_IDLE };
    let target: Element | null = null;
    let frame = 0;
    let running = false;

    const step = () => {
      let tx = pointer.x;
      let ty = pointer.y;
      let tw = RING_IDLE;
      let th = RING_IDLE;
      if (target?.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        tw = r.width + 14;
        th = r.height + 12;
      }
      const k = 0.2;
      box.x += (tx - box.x) * k;
      box.y += (ty - box.y) * k;
      box.w += (tw - box.w) * k;
      box.h += (th - box.h) * k;

      ring.style.transform = `translate3d(${box.x - box.w / 2}px, ${box.y - box.h / 2}px, 0)`;
      ring.style.width = `${box.w}px`;
      ring.style.height = `${box.h}px`;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;

      const settled =
        Math.abs(tx - box.x) < 0.3 &&
        Math.abs(ty - box.y) < 0.3 &&
        Math.abs(tw - box.w) < 0.3 &&
        Math.abs(th - box.h) < 0.3;
      if (settled && !target) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(step);
    };

    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.seen) {
        pointer.seen = true;
        box.x = pointer.x;
        box.y = pointer.y;
        ring.parentElement!.style.opacity = "1";
        dot.parentElement!.style.opacity = "1";
      }
      target = (event.target as Element | null)?.closest(INTERACTIVE) ?? null;
      ring.dataset.locked = target ? "1" : "0";
      kick();
    };
    const onLeave = () => {
      pointer.seen = false;
      ring.parentElement!.style.opacity = "0";
      dot.parentElement!.style.opacity = "0";
    };
    const onDown = () =>
      ring.animate([{ scale: 1 }, { scale: 0.82 }, { scale: 1 }], {
        duration: 320,
      });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", kick);
    };
  }, [enabled, preference]);

  if (!enabled) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="radar-cursor-root pointer-events-none fixed inset-0 z-[60] opacity-0 mix-blend-difference transition-opacity duration-300"
      >
        <div
          ref={ringRef}
          className="radar-cursor group/cursor absolute top-0 left-0 rounded-full border border-white/70 data-[locked='1']:rounded-[2px] data-[locked='1']:border-white"
          style={{ width: RING_IDLE, height: RING_IDLE }}
        >
          {/* Range ticks; they turn into target-box corners when locked. */}
          <span className="absolute top-1/2 -left-2 h-px w-2 bg-white group-data-[locked='1']/cursor:opacity-0" />
          <span className="absolute top-1/2 -right-2 h-px w-2 bg-white group-data-[locked='1']/cursor:opacity-0" />
          <span className="absolute -top-2 left-1/2 h-2 w-px bg-white group-data-[locked='1']/cursor:opacity-0" />
          <span className="absolute -bottom-2 left-1/2 h-2 w-px bg-white group-data-[locked='1']/cursor:opacity-0" />
        </div>
      </div>
      {/* Outside the difference blend, so the green stays green. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[61] opacity-0 transition-opacity duration-300"
      >
        <div
          ref={dotRef}
          className="absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-echo-2"
        />
      </div>
    </>
  );
}

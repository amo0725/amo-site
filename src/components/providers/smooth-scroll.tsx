"use client";

import { useEffect } from "react";
import { useMotionPreference } from "@/lib/motion/preference";

/**
 * Inertial wheel scrolling for mouse and trackpad users only.
 * Touch devices and reduced-motion visitors keep native scrolling, and the
 * library is loaded on demand so it never touches the critical path.
 */
export function SmoothScroll() {
  const preference = useMotionPreference();

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || preference === "reduced") return;

    let disposed = false;
    let destroy: (() => void) | undefined;

    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        anchors: { offset: -56 },
        // Hand the wheel to a nested panel only while it can actually scroll
        // vertically. Marking a region as native unconditionally makes the
        // page drop out of smoothing whenever the cursor crosses it, which
        // reads as a hitch.
        prevent: (node) =>
          node.hasAttribute("data-native-scroll") &&
          node.scrollHeight > node.clientHeight + 1 &&
          getComputedStyle(node).overflowY !== "visible",
      });
      destroy = () => lenis.destroy();
    });

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [preference]);

  return null;
}

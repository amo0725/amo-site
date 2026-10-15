"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useMotionPreference } from "@/lib/motion/preference";

/** Animation features are fetched after hydration so they stay out of the first-load bundle. */
const loadFeatures = () =>
  import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  const preference = useMotionPreference();
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion={preference === "reduced" ? "always" : "never"}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

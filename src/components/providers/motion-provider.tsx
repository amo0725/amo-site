"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { streamSettled, useStreamSettled } from "@/lib/stream-settled";
import { useMotionPreference } from "@/lib/motion/preference";

/**
 * Animation features are fetched after hydration so they stay out of the
 * first-load bundle, and only once every streamed section is in place:
 * their arrival changes context, which would otherwise make React render
 * a not-yet-hydrated section again on the client (see stream-settled.ts).
 */
const loadFeatures = () =>
  streamSettled()
    .then(() => import("./motion-features"))
    .then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  const preference = useMotionPreference();
  // Same reason: the preference is only handed down once the page has
  // settled (the server can't know it, so it differs during hydration).
  const settled = useStreamSettled();
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion={settled && preference === "reduced" ? "always" : "never"}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

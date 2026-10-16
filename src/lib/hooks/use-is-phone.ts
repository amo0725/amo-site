"use client";

import { useSyncExternalStore } from "react";

/** Below Tailwind's md breakpoint. Keep in sync with PHONE_QUERY users in CSS. */
export const PHONE_QUERY = "(max-width: 47.99rem)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * True on phone-width screens. The server (and the first client render)
 * answers false, so markup is always the desktop version until hydration;
 * use it only for content below the first screen.
 */
export function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

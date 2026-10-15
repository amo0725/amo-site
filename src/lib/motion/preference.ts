"use client";

import { useSyncExternalStore } from "react";
import { MOTION_STORAGE_KEY, type MotionPreference } from "./boot";

export type { MotionPreference };

export function readMotionPreference(): MotionPreference {
  return document.documentElement.dataset.motion === "reduced"
    ? "reduced"
    : "full";
}

export function setMotionPreference(value: MotionPreference): void {
  document.documentElement.dataset.motion = value;
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, value);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies to this visit.
  }
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  return () => observer.disconnect();
}

/** Live motion preference. Server render assumes full motion. */
export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(subscribe, readMotionPreference, () => "full");
}

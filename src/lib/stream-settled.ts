"use client";

import { useSyncExternalStore } from "react";

/*
 * The home page's sections arrive as streamed Suspense segments, parked in
 * hidden holders (div[hidden][id^="S:"]) until React's inline script moves
 * them into place. Until then a section is not hydrated yet, and any
 * context change above it (Motion's features arriving, the motion
 * preference) makes React throw the streamed HTML away and render the
 * section again on the client, losing what was set before the first paint
 * (the open cases). Work that changes such context waits for this.
 */

const SETTLE_TIMEOUT_MS = 5000;
let forced = false;
const pending = () =>
  !forced && document.querySelector('div[hidden][id^="S:"]') !== null;

function subscribe(onChange: () => void) {
  if (!pending()) return () => {};
  const observer = new MutationObserver(() => {
    if (!pending()) onChange();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const timer = window.setTimeout(() => {
    forced = true;
    onChange();
  }, SETTLE_TIMEOUT_MS);
  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
  };
}

/** True once every streamed section is in place (false on the server). */
export function useStreamSettled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !pending(),
    () => false,
  );
}

/** Resolves once every streamed section is in place. */
export function streamSettled(): Promise<void> {
  return new Promise((resolve) => {
    if (!pending()) return resolve();
    const unsubscribe = subscribe(() => {
      unsubscribe();
      resolve();
    });
  });
}

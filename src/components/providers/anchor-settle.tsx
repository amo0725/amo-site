"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/motion/lenis-instance";

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) =>
      left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(n);
  });

const sleep = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Opens what a link points into: the target itself when it is a fold
 * (a case in the work log), the fold it holds (an area of ownership), and
 * every fold around it. A link that says "this case" lands on the case
 * open, not on a closed line.
 */
function reveal(el: HTMLElement) {
  if (el instanceof HTMLDetailsElement) el.open = true;
  const inner = el.querySelector(":scope > details");
  if (inner instanceof HTMLDetailsElement) inner.open = true;
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (p instanceof HTMLDetailsElement) p.open = true;
  }
}

/**
 * Sections below the fold use content-visibility: auto with a guessed
 * height (1100px) until they are first drawn, so a jump to #section can
 * land several sections off: the browser (or Lenis) measures the target
 * against guesses that are wrong by the time it arrives.
 *
 * Folds on the way to the target are opened first (reveal), so a link to
 * a case or an area lands on it open.
 *
 * Before the first jump to an in-page target, content-visibility is turned
 * off for the rest of the visit (html.cv-measure), so that jump and every
 * later one are measured against real heights. Visitors who only scroll
 * keep the rendering savings. Runs on arrival with a hash (a shared link,
 * or the language switch keeping the section) and on the first click on a
 * #link.
 */
export function AnchorSettle() {
  useEffect(() => {
    const root = document.documentElement;

    // Synchronous, so a click handler right after (Lenis, or the browser's
    // own jump) already sees real heights.
    let measured = false;
    const measure = () => {
      if (!measured) {
        measured = true;
        root.classList.add("cv-measure");
        void root.offsetHeight;
      }
      getLenis()?.resize();
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href === "#top") return;
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (target) reveal(target);
      measure();
    };
    // Capture phase, ahead of Lenis's own anchor handling.
    document.addEventListener("click", onClick, true);

    // Arrived with a hash. Sections stream in after the first paint inside
    // hidden holders, where neither the browser's own jump nor
    // scrollIntoView can reach them, so wait until the target is in the
    // page proper (up to 5 s), then measure and land.
    let cancelled = false;
    let poll = 0;
    const id = decodeURIComponent(location.hash.slice(1));

    const land = (el: HTMLElement) => {
      // Lenis caches the page height and its own position: move through it,
      // or it pulls the page back. It subtracts the header's scroll-padding
      // itself.
      const lenis = getLenis();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(el, { immediate: true, force: true });
      } else {
        el.scrollIntoView();
      }
    };
    // Where the target sits in the document (not on screen), so a reader
    // scrolling away is never mistaken for the layout moving.
    const docTop = (el: HTMLElement) =>
      el.getBoundingClientRect().top + window.scrollY;

    // The reader taking over ends any further correction.
    let userMoved = false;
    const takeOver = () => {
      userMoved = true;
    };
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) =>
      window.addEventListener(type, takeOver, { passive: true, once: true }),
    );

    const settle = async (el: HTMLElement) => {
      reveal(el);
      measure();
      await frames(1);
      if (cancelled || userMoved) return;
      land(el);
      const landedAt = docTop(el);
      // Smooth scrolling loads on demand and late images or fonts can move
      // the target: check twice more, and land again only if the target
      // itself moved in the document and the reader hasn't scrolled.
      for (const wait of [500, 1200]) {
        await sleep(wait);
        if (cancelled || userMoved) return;
        if (Math.abs(docTop(el) - landedAt) > 8) land(el);
      }
    };

    if (id && id !== "top") {
      const started = performance.now();
      const tryLand = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (!el || el.closest("[hidden]")) {
          if (performance.now() - started < 5000) {
            poll = requestAnimationFrame(tryLand);
          }
          return;
        }
        void settle(el);
      };
      tryLand();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(poll);
      inputs.forEach((type) => window.removeEventListener(type, takeOver));
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}

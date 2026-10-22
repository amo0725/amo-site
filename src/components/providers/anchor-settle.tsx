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
 * Opened at a #target (a shared link, a "back to this case", the language
 * switch), the boot script has already turned content-visibility off for
 * the visit (html.cv-measure), so the browser's own jump and the landing
 * here are measured against real heights.
 *
 * A click on an in-page #link is taken over: the click paints at once (a
 * menu closing, a pressed state) and the jump follows in the next task.
 * Only the sections up to the target are drawn for real before it, not
 * the whole page, so the first link of a visit stays quick. Lenis glides
 * there (its own anchor handling is off); without it the browser jumps,
 * and the address, :target and the focus point follow as usual.
 *
 * The hash can also change with no click: Back and Forward between two
 * in-page targets, an edited address, a page restored from the back/forward
 * cache. Each opens what the new target sits in; a history move keeps the
 * position the browser restored when the target is already in view.
 */
export function AnchorSettle() {
  useEffect(() => {
    const root = document.documentElement;

    // Every section drawn for real, for the rest of the visit.
    const measure = () => {
      if (!root.classList.contains("cv-measure")) {
        root.classList.add("cv-measure");
        void root.offsetHeight;
      }
      getLenis()?.resize();
    };
    // Only the sections up to (and holding) the target.
    const measureUpTo = (target: HTMLElement) => {
      if (!root.classList.contains("cv-measure")) {
        const host = target.closest("main > section, body > footer");
        const blocks = document.querySelectorAll<HTMLElement>(
          "main > section, body > footer",
        );
        for (const block of blocks) {
          block.style.contentVisibility = "visible";
          if (block === host) break;
        }
      }
      getLenis()?.resize();
    };

    // A jump made here must not be landed again by the hashchange it causes.
    let clickedAt = -Infinity;
    const go = (id: string, target: HTMLElement | null, keyboard: boolean) => {
      if (target) {
        reveal(target);
        measureUpTo(target);
      }
      const lenis = getLenis();
      if (lenis) {
        if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
        lenis.scrollTo(target ?? 0);
        if (target) {
          // What :target would show after a real navigation.
          target.classList.add("landed");
          window.setTimeout(() => target.classList.remove("landed"), 700);
          // A keyboard user continues from the target, as after a native jump.
          if (keyboard) {
            if (!target.hasAttribute("tabindex")) {
              target.tabIndex = -1;
              target.classList.add("focus-point");
            }
            target.focus({ preventScroll: true });
          }
        }
      } else if (location.hash === `#${id}`) {
        (target ?? document.documentElement).scrollIntoView();
      } else {
        location.hash = id;
      }
    };
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href === "#") return;
      const id = decodeURIComponent(href.slice(1));
      const target = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !target) return;
      e.preventDefault();
      clickedAt = performance.now();
      const keyboard = e.detail === 0;
      requestAnimationFrame(() =>
        window.setTimeout(() => go(id, target, keyboard), 0),
      );
    };
    // Capture phase, ahead of anything else on the page.
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
      if (returning && window.scrollY > 0 && inView(el)) return;
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

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    // Back/Forward between in-page targets: popstate comes first, with the
    // scroll position already restored.
    let traversing = false;
    const onPop = () => {
      traversing = true;
    };
    const onHash = () => {
      const fromHistory = traversing;
      traversing = false;
      if (performance.now() - clickedAt < 1000) return;
      const next = decodeURIComponent(location.hash.slice(1));
      const el = next && next !== "top" ? document.getElementById(next) : null;
      if (!el) return;
      reveal(el);
      measureUpTo(el);
      requestAnimationFrame(() => {
        if (fromHistory && inView(el)) return;
        land(el);
      });
    };
    // Restored from the back/forward cache: the page is as it was left,
    // but make sure what the address points at is open.
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const next = decodeURIComponent(location.hash.slice(1));
      const el = next ? document.getElementById(next) : null;
      if (el) reveal(el);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("pageshow", onShow);

    // Coming back to this page (Back, Forward): the browser may already
    // have restored a position that shows the target; keep it if so.
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const returning = nav?.type === "back_forward";

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
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("pageshow", onShow);
      inputs.forEach((type) => window.removeEventListener(type, takeOver));
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}

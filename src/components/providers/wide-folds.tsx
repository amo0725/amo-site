"use client";

import { useEffect } from "react";

const WIDE = "(min-width: 48rem)";

/**
 * From md up a PhoneFold's content is always shown (CSS) and its summary is
 * a plain heading. This marks those folds open, so their state is the true
 * one for assistive tech, and takes their summaries out of the tab order;
 * below md it hands them back as toggles, closing the ones it opened.
 * Browsers that can't show a closed fold's content keep the toggles.
 */
export function WideFolds() {
  useEffect(() => {
    if (!CSS.supports("selector(::details-content)")) return;
    const wide = window.matchMedia(WIDE);
    const apply = () => {
      const folds = document.querySelectorAll<HTMLDetailsElement>(
        "details.phone-fold",
      );
      for (const fold of folds) {
        const summary = fold.querySelector<HTMLElement>(":scope > summary");
        if (wide.matches) {
          if (!fold.open) {
            fold.open = true;
            fold.dataset.wideOpen = "";
          }
          summary?.setAttribute("tabindex", "-1");
        } else {
          summary?.removeAttribute("tabindex");
          if (fold.dataset.wideOpen !== undefined) {
            fold.open = false;
            delete fold.dataset.wideOpen;
          }
        }
      }
    };
    apply();
    // Sections can arrive after hydration: catch their folds too.
    window.addEventListener("load", apply);
    wide.addEventListener("change", apply);
    return () => {
      window.removeEventListener("load", apply);
      wide.removeEventListener("change", apply);
    };
  }, []);
  return null;
}

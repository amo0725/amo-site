/** sessionStorage key: the ids of the cases the reader left open. */
export const OPEN_CASES_KEY = "open-cases";

/**
 * Decides which cases are open, before the first paint (as an inline
 * script right after the list), so nothing opens and pushes the page after
 * a shared #link has landed.
 *
 * - Coming back (Back, Forward or reload) restores the cases the reader
 *   had open in this tab.
 * - A #case link opens that case.
 * - Otherwise, from md up, the first featured case opens; phones get the
 *   list as an outline.
 *
 * Each case it has seen is marked data-pre, so the list can tell when its
 * rows were rendered again on the client and run this once more.
 *
 * Self-contained (no imports, no closures): it is also serialised into the
 * page with Function.prototype.toString.
 */
export function applyOpenCases(key: string) {
  try {
    const list = document.querySelectorAll<HTMLDetailsElement>(
      "#work details.log-entry",
    );
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    let saved: string[] | null = null;
    if (nav && (nav.type === "back_forward" || nav.type === "reload")) {
      try {
        saved = JSON.parse(sessionStorage.getItem(key) || "null");
      } catch {
        saved = null;
      }
    }
    const target = decodeURIComponent(location.hash.slice(1));
    const wide = matchMedia("(min-width: 48rem)").matches;
    let first = true;
    for (const d of list) {
      const featured = d.hasAttribute("data-featured");
      d.open = saved
        ? saved.indexOf(d.id) >= 0
        : d.id === target || (featured && first && wide);
      if (featured) first = false;
      d.setAttribute("data-pre", "");
    }
  } catch {
    // Leave the list as served.
  }
}

export const openCasesScript = `(${applyOpenCases.toString()})(${JSON.stringify(OPEN_CASES_KEY)})`;

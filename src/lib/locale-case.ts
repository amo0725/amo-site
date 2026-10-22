import type { Route } from "next";
import { permanentRedirect } from "next/navigation";
import { locales } from "@/content/locales";
import type { Locale } from "@/content/types";

/**
 * The language a path segment names, in any case: "EN" and "zh-tw" are
 * en and zh-TW. Null when it names none.
 */
export function localeIn(segment: string): Locale | null {
  const lower = segment.toLowerCase();
  return locales.find((l) => l.toLowerCase() === lower) ?? null;
}

/**
 * A language typed in another case (/EN, /zh-tw/work/…) goes to the real
 * address with a 308. The pages do this, not the proxy: Vercel matches the
 * proxy's paths without regard to case, so a matcher that leaves /en alone
 * leaves /EN alone too. (The query is dropped: the pages are fully static
 * and may not read it.)
 */
export function redirectMiscased(lang: string, rest = ""): void {
  const locale = localeIn(lang);
  if (locale && locale !== lang) {
    permanentRedirect(`/${locale}${rest}` as Route);
  }
}

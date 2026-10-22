import { en } from "./en";
import type { Locale, SiteContent } from "./types";
import { zhTW } from "./zh-TW";

import { locales } from "./locales";

export { locales };
export const defaultLocale: Locale = "zh-TW";

const content: Readonly<Record<Locale, SiteContent>> = { "zh-TW": zhTW, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}

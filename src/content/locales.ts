import type { Locale } from "./types";

/** The site's languages; zh-TW first. Kept apart from the content, so the
    proxy can use it without bundling every string. */
export const locales = ["zh-TW", "en"] as const satisfies readonly Locale[];

import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getContent, locales } from "@/content";

/** One entry per path, with its other-language twin as an alternate. */
function entry(
  path: (locale: string) => string,
  priority: (locale: string) => number,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${site.url}${path(l)}`]),
  );
  return locales.map((locale) => ({
    url: `${site.url}${path(locale)}`,
    changeFrequency: "monthly",
    priority: priority(locale),
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const c = getContent("en");
  return [
    ...entry(
      (l) => `/${l}`,
      (l) => (l === "zh-TW" ? 1 : 0.9),
    ),
    ...c.experience
      .filter((t) => !t.earlier)
      .flatMap((t) =>
        entry(
          (l) => `/${l}/experience/${t.id}`,
          () => 0.7,
        ),
      ),
    ...c.work.entries.flatMap((e) =>
      entry(
        (l) => `/${l}/work/${e.id}`,
        () => 0.6,
      ),
    ),
  ];
}

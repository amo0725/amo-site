import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { locales } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${site.url}/${l}`]),
  );
  return locales.map((locale) => ({
    url: `${site.url}/${locale}`,
    changeFrequency: "monthly",
    priority: locale === "zh-TW" ? 1 : 0.9,
    alternates: { languages },
  }));
}

import type { MetadataRoute } from "next";
import { defaultLocale, getContent } from "@/content";

export default function manifest(): MetadataRoute.Manifest {
  const { meta, profile, htmlLang } = getContent(defaultLocale);
  return {
    name: meta.title,
    short_name: profile.name,
    description: meta.description,
    start_url: `/${defaultLocale}`,
    display: "browser",
    background_color: "#e6ebe8",
    theme_color: "#e6ebe8",
    lang: htmlLang,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

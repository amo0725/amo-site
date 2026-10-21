import type { Metadata } from "next";
import { locales } from "@/content";
import type { Locale, SiteContent } from "@/content/types";

/**
 * Metadata for a page that expands one item (a case, a body of work). A
 * page's openGraph replaces the layout's whole object, so everything the
 * layout sets there (locale, site name, the card image) is set again here,
 * along with a twitter card that names the page rather than the site.
 */
export function detailMetadata({
  content,
  path,
  title,
  description,
  type = "article",
}: {
  content: SiteContent;
  /** Path after the locale, e.g. "/work/vanishing-index". */
  path: string;
  title: string;
  description: string;
  type?: "article" | "profile";
}): Metadata {
  const lang = content.locale;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}${path}`]),
  ) as Record<Locale, string>;
  const url = languages[lang];
  const image = `/${lang}/opengraph-image/card`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ...languages, "x-default": languages["zh-TW"] },
    },
    openGraph: {
      type,
      locale: content.ogLocale,
      url,
      siteName: content.profile.fullName,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: content.meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

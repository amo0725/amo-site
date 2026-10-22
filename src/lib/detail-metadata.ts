import type { Metadata } from "next";
import { defaultLocale, getContent, isLocale, locales } from "@/content";
import type { Locale, SiteContent } from "@/content/types";

/**
 * Title of a case or body of work that doesn't exist, the same as every
 * other 404 on the site, and kept out of the index.
 */
export function notFoundMetadata(lang: string): Metadata {
  const c = getContent(isLocale(lang) ? lang : defaultLocale);
  return {
    title: `404 · ${c.ui.notFound.title}`,
    robots: { index: false },
  };
}

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
  image,
}: {
  content: SiteContent;
  /** Path after the locale, e.g. "/work/vanishing-index". */
  path: string;
  title: string;
  description: string;
  type?: "article" | "profile";
  /** The page's own share card (path and alt); the site's card otherwise. */
  image?: { url: string; alt: string };
}): Metadata {
  const lang = content.locale;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}${path}`]),
  ) as Record<Locale, string>;
  const url = languages[lang];
  const card = image ?? {
    url: `/${lang}/opengraph-image/card`,
    alt: content.meta.ogAlt,
  };
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
      images: [{ url: card.url, width: 1200, height: 630, alt: card.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: card.url, alt: card.alt }],
    },
  };
}

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { AnchorSettle } from "@/components/providers/anchor-settle";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { WideFolds } from "@/components/providers/wide-folds";
import { RadarCursor } from "@/components/ui/radar-cursor";
import { site } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import { motionBootScript } from "@/lib/motion/boot";
import { archivo, archivoName } from "../fonts";
import "../globals.css";

/** Every route on this site must prerender completely. */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const localePath = { "zh-TW": "/zh-TW", en: "/en" } as const;

/**
 * Chromium's speculation rules: a case or a body of work starts loading
 * when a link to it is hovered or pressed (its script is already cached,
 * so only ~10 KB of HTML), and opens at once. The home page is only
 * fetched ahead, never prerendered: it would hydrate and may start the
 * radar in a hidden tab. Other browsers ignore the script.
 */
const speculationRules = JSON.stringify({
  prerender: [
    {
      where: {
        or: [
          { href_matches: "/*/work/*" },
          { href_matches: "/*/experience/*" },
        ],
      },
      eagerness: "moderate",
    },
  ],
  prefetch: [
    {
      where: {
        or: ["/en", "/en#*", "/zh-TW", "/zh-TW#*"].map((href) => ({
          href_matches: href,
        })),
      },
      eagerness: "conservative",
    },
  ],
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta, profile, ogLocale } = getContent(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: meta.title, template: `%s｜${profile.fullName}` },
    description: meta.description,
    authors: [{ name: profile.fullName }],
    alternates: {
      canonical: localePath[lang],
      languages: { ...localePath, "x-default": "/" },
    },
    openGraph: {
      type: "profile",
      locale: ogLocale,
      url: localePath[lang],
      siteName: profile.fullName,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    formatDetection: { telephone: false, email: false, address: false },
    // The commit a Vercel build was made from, so the post-deploy check
    // knows the live site is the deploy it is checking.
    ...(BUILD_COMMIT ? { other: { "build-commit": BUILD_COMMIT } } : {}),
  };
}

const BUILD_COMMIT = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12);

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6ebe8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1820" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { htmlLang, ui } = getContent(lang);

  return (
    // data-motion is set by the boot script before React hydrates.
    <html
      lang={htmlLang}
      className={`${archivo.variable} ${archivoName.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: speculationRules }}
        />
      </head>
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {ui.skipLink}
        </a>
        {/* The Motion provider lives on the home page, the only page with
            Motion components: detail pages don't download it. */}
        <SmoothScroll />
        <AnchorSettle />
        <WideFolds />
        <RadarCursor />
        {children}
      </body>
    </html>
  );
}

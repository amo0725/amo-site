import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { MotionProvider } from "@/components/providers/motion-provider";
import { AnchorSettle } from "@/components/providers/anchor-settle";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { RadarCursor } from "@/components/ui/radar-cursor";
import { site } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import { motionBootScript } from "@/lib/motion/boot";
import { archivo } from "../fonts";
import "../globals.css";

/** Every route on this site must prerender completely. */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const localePath = { "zh-TW": "/zh-TW", en: "/en" } as const;

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
  };
}

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
    <html lang={htmlLang} className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {ui.skipLink}
        </a>
        <MotionProvider>
          <SmoothScroll />
          <AnchorSettle />
          <RadarCursor />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}

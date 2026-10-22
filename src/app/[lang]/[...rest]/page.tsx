import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/not-found-view";
import { getContent, isLocale, locales } from "@/content";
import { redirectMiscased } from "@/lib/locale-case";

/**
 * The 404 for every other address: the proxy sends any path that leads
 * nowhere here (with a 404 status), so the page itself is static, fully
 * rendered HTML in the reader's language.
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang, rest: ["404"] }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[...rest]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: `404 · ${getContent(lang).ui.notFound.title}`,
    robots: { index: false },
  };
}

export default async function UnknownPath({
  params,
}: PageProps<"/[lang]/[...rest]">) {
  const { lang, rest } = await params;
  redirectMiscased(lang, `/${rest.join("/")}`);
  return <NotFoundView content={getContent(isLocale(lang) ? lang : "zh-TW")} />;
}

import type { Metadata } from "next";
import { lang } from "next/root-params";
import { NotFoundView } from "@/components/layout/not-found-view";
import { defaultLocale, getContent, isLocale } from "@/content";

async function content() {
  const value = await lang();
  return getContent(isLocale(value) ? value : defaultLocale);
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await content();
  return { title: `404 · ${c.ui.notFound.title}` };
}

/**
 * A case or body of work that doesn't exist (a mistyped or retired id):
 * the page calls notFound() and this renders, with a 404 status.
 */
export default async function NotFound() {
  return <NotFoundView content={await content()} />;
}

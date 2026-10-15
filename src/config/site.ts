import type { SectionKey, WorkCategory } from "@/content/types";

/** Global, language-independent settings. */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://amo.example.com",
} as const;

export const copyrightYear = 2026;

/**
 * In-page sections, in document order. Each owns one band of a weather
 * radar's reflectivity scale; the header nav, the side legend and each
 * section title use it. Labels come from the locale content.
 */
export const sections = [
  { id: "signal", key: "signal", colorVar: "--band-1" },
  { id: "experience", key: "experience", colorVar: "--band-2" },
  { id: "systems", key: "systems", colorVar: "--band-3" },
  { id: "work", key: "work", colorVar: "--band-4" },
  { id: "principles", key: "principles", colorVar: "--band-5" },
  { id: "ai", key: "ai", colorVar: "--band-6" },
  { id: "projects", key: "projects", colorVar: "--band-7" },
  { id: "off-duty", key: "offDuty", colorVar: "--band-8" },
  { id: "contact", key: "contact", colorVar: "--band-9" },
] as const satisfies ReadonlyArray<{
  id: string;
  key: SectionKey;
  colorVar: string;
}>;

export type SectionMeta = (typeof sections)[number];
export type SectionId = SectionMeta["id"];

export function sectionMeta(id: SectionId): SectionMeta {
  const meta = sections.find((s) => s.id === id);
  if (!meta) throw new Error(`Unknown section: ${id}`);
  return meta;
}

/** Work-log category colours reuse the echo scale. */
export const categoryColor: Readonly<Record<WorkCategory, `--${string}`>> = {
  incident: "--echo-5",
  payments: "--echo-4",
  integration: "--echo-2",
  architecture: "--echo-1",
  data: "--echo-3",
  product: "--echo-6",
};

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { categoryColor } from "@/config/site";
import { getContent, isLocale, locales } from "@/content";
import type { WorkCategory } from "@/content/types";
import { caseCard } from "@/lib/og-card-text";
import { CELL, cells, ECHO, fontBytes, loadFonts, OG_SIZE } from "@/lib/og";
import covered from "@/assets/fonts/og-cjk-chars.json";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getContent(lang).work.entries.map((e) => ({ lang, id: e.id })),
  );
}

/** A category's pen, as a plain colour (--echo-1 … --echo-6). */
const pen = (category: WorkCategory) =>
  ECHO[Number(categoryColor[category].slice(-1)) - 1] ?? ECHO[0];

const coveredChars = new Set(covered as string);
/** Whether the card's Chinese face has every character of a text. */
const fits = (text: string) =>
  [...text].every((c) => c.codePointAt(0)! <= 0x2000 || coveredChars.has(c));

function find(lang: string, id: string) {
  if (!isLocale(lang)) return null;
  const content = getContent(lang);
  const entry = content.work.entries.find((e) => e.id === id);
  if (!entry) return null;
  // A zh title with a character the cut face lacks (a case added since
  // scripts/og-font.mjs last ran) gets the English card rather than gaps.
  const card = caseCard(content, entry);
  if (Object.values(card).every(fits)) return { entry, card };
  const en = getContent("en");
  const fallback = en.work.entries.find((e) => e.id === id) ?? entry;
  return { entry: fallback, card: caseCard(en, fallback) };
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const found = find(lang, id);
  const alt = found ? `${found.card.title} · ${found.card.byline}` : "Amo Feng";
  return [{ id: "card", alt, size, contentType }];
}

/**
 * A case's share card: what kind of case and where, its title, the figure
 * it moved, and who wrote it, on the same paper and radar cells as the
 * site's own card.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const found = find(lang, id);
  if (!found) notFound();
  const { regular, heavy, cjk } = await loadFonts();
  const card = found?.card;
  const color = found ? pen(found.entry.category) : ECHO[0];
  const long = (card?.title.length ?? 0) > 60;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#e6ebe8",
        color: "#142030",
        fontFamily: "Archivo",
      }}
    >
      {cells(29).map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          style={{
            position: "absolute",
            left: cell.x + 2,
            top: cell.y + 2,
            width: CELL - 4,
            height: CELL - 4,
            background: cell.color,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          bottom: 64,
          width: 820,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#3d4b57",
          }}
        >
          <div
            style={{ width: 20, height: 20, background: color, marginRight: 16 }}
          />
          {card?.kicker ?? ""}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: long ? 54 : 64,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          {card?.title ?? "Amo Feng"}
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            fontSize: 38,
            fontWeight: 800,
            color: "#0b7029",
          }}
        >
          <div
            style={{ width: 16, height: 16, background: "#129a3a", marginRight: 16 }}
          />
          {card?.figure ?? ""}
        </div>
        <div style={{ marginTop: 18, fontSize: 28, fontWeight: 400 }}>
          {card?.byline ?? ""}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Archivo", data: fontBytes(regular), weight: 400, style: "normal" },
        { name: "Archivo", data: fontBytes(heavy), weight: 800, style: "normal" },
        // Chinese glyphs fall back to this cut of Noto Sans TC (one weight).
        { name: "Noto Sans TC", data: fontBytes(cjk), weight: 800, style: "normal" },
        { name: "Noto Sans TC", data: fontBytes(cjk), weight: 400, style: "normal" },
      ],
    },
  );
}

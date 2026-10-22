import { ImageResponse } from "next/og";
import { getContent, isLocale, locales } from "@/content";
import { CELL, cells, fontBytes, loadFonts, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const alt = isLocale(lang) ? getContent(lang).meta.ogAlt : "Amo Feng";
  return [{ id: "card", alt, size, contentType }];
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  const { regular, heavy } = await loadFonts();
  // The OG font only carries Latin glyphs, so the subtitle uses the English role line.
  const { profile } = getContent("en");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#e6ebe8",
      }}
    >
      {cells().map((cell) => (
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
          bottom: 64,
          display: "flex",
          flexDirection: "column",
          color: "#142030",
        }}
      >
        <div
          style={{
            fontFamily: "Archivo",
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 0.85,
            letterSpacing: -4,
          }}
        >
          Amo Feng
        </div>
        <div
          style={{
            fontFamily: "Archivo",
            fontWeight: 800,
            fontSize: 40,
            marginTop: 32,
          }}
        >
          {`${profile.role} · ${profile.place}`}
        </div>
        <div
          style={{
            fontFamily: "Archivo",
            fontWeight: 400,
            fontSize: 32,
            marginTop: 8,
            maxWidth: 660,
          }}
        >
          {profile.positioning}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Archivo",
          data: fontBytes(regular),
          weight: 400,
          style: "normal",
        },
        {
          name: "Archivo",
          data: fontBytes(heavy),
          weight: 800,
          style: "normal",
        },
      ],
    },
  );
}

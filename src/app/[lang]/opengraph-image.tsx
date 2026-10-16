import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getContent, isLocale, locales } from "@/content";
import { fbm } from "@/lib/noise";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const ECHO = ["#2fa9dc", "#129a3a", "#e1c200", "#f07c00", "#d8141c", "#9b1593"];
const COLS = 40;
const ROWS = 21;
const CELL = 30;

function cells() {
  const out: Array<{ x: number; y: number; color: string }> = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const n = fbm(c * 0.17 + 9.1, r * 0.17 + 2.4);
      // Keep the left two thirds clear: the name and role sit there on plain paper.
      const fade = Math.max(0, Math.min(1, (c - 23) / 7));
      const intensity = Math.max(0, (n - 0.5) / 0.3) * fade;
      if (intensity < 0.14) continue;
      const band = Math.min(5, Math.floor(((intensity - 0.14) / 0.86) * 6));
      out.push({ x: c * CELL, y: r * CELL, color: ECHO[band] });
    }
  }
  return out;
}

/** Cached so the image can be prerendered at build time. */
async function loadFonts() {
  "use cache";
  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, heavy] = await Promise.all([
    readFile(join(dir, "archivo-latin-400-normal.woff")),
    readFile(join(dir, "archivo-latin-800-normal.woff")),
  ]);
  return { regular: new Uint8Array(regular), heavy: new Uint8Array(heavy) };
}

/**
 * The exact bytes of a font. A cached Uint8Array can come back as a view
 * into a larger buffer, so handing over `.buffer` as is would pass the
 * renderer bytes that are not the font (it then fails on the signature).
 */
function fontBytes(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength,
  ) as ArrayBuffer;
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

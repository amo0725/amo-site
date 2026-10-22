import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fbm } from "@/lib/noise";

/** Share cards: 1200 × 630 PNG. */
export const OG_SIZE = { width: 1200, height: 630 };

/** The echo scale, as plain colours for the image renderer. */
export const ECHO = ["#2fa9dc", "#129a3a", "#e1c200", "#f07c00", "#d8141c", "#9b1593"];
const COLS = 40;
const ROWS = 21;
export const CELL = 30;

/**
 * The radar cells of a card, clear of everything left of column `clearTo`
 * (fading in over the next seven), where the text sits on plain paper.
 */
export function cells(clearTo = 23) {
  const out: Array<{ x: number; y: number; color: string }> = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const n = fbm(c * 0.17 + 9.1, r * 0.17 + 2.4);
      const fade = Math.max(0, Math.min(1, (c - clearTo) / 7));
      const intensity = Math.max(0, (n - 0.5) / 0.3) * fade;
      if (intensity < 0.14) continue;
      const band = Math.min(5, Math.floor(((intensity - 0.14) / 0.86) * 6));
      out.push({ x: c * CELL, y: r * CELL, color: ECHO[band] });
    }
  }
  return out;
}

/** Cached so the image can be prerendered at build time. */
export async function loadFonts() {
  "use cache";
  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, heavy, cjk] = await Promise.all([
    readFile(join(dir, "archivo-latin-400-normal.woff")),
    readFile(join(dir, "archivo-latin-800-normal.woff")),
    readFile(join(dir, "og-cjk-700.woff")),
  ]);
  return {
    regular: new Uint8Array(regular),
    heavy: new Uint8Array(heavy),
    cjk: new Uint8Array(cjk),
  };
}

/**
 * The exact bytes of a font. A cached Uint8Array can come back as a view
 * into a larger buffer, so handing over `.buffer` as is would pass the
 * renderer bytes that are not the font (it then fails on the signature).
 */
export function fontBytes(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength,
  ) as ArrayBuffer;
}


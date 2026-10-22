import localFont from "next/font/local";

/**
 * Archivo variable (weight 400–900, width 62–125%), subset to the Latin
 * glyphs the site uses. Self-hosted so builds are deterministic; the width
 * axis drives the headline motion. Chinese falls back to the system CJK font.
 *
 * Not preloaded: the first screen's largest text (the positioning line)
 * paints in the size-matched fallback and swaps, rather than waiting on
 * 45 KB in the first round trips.
 */
export const archivo = localFont({
  src: "../assets/fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

/**
 * The same face cut down to the letters of "Amo Feng" (5 KB, every axis),
 * preloaded: the name is set in it on the first screen (the hero, whose
 * width animates, and the header), so it never swaps in late.
 */
export const archivoName = localFont({
  src: "../assets/fonts/archivo-name.woff2",
  variable: "--font-name",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: true,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

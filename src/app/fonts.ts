import localFont from "next/font/local";

/**
 * Archivo variable (weight 400–900, width 62–125%), subset to the Latin
 * glyphs the site uses. Self-hosted so builds are deterministic; the width
 * axis drives the headline motion. Chinese falls back to the system CJK font.
 */
export const archivo = localFont({
  src: "../assets/fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

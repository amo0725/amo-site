/** sRGB colour triplets in 0–1, read straight from the CSS tokens. */
export type Rgb = readonly [number, number, number];

export interface RadarPalette {
  paper: Rgb;
  graticule: Rgb;
  /** dBZ scale, light → hail. */
  echoes: readonly [Rgb, Rgb, Rgb, Rgb, Rgb, Rgb];
}

const FALLBACK: Rgb = [0.5, 0.5, 0.5];

function parseHex(value: string): Rgb {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return FALLBACK;
  const n = Number.parseInt(hex, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The canvas uses the same tokens as the page, so both themes stay in sync. */
export function readPalette(element: Element): RadarPalette {
  const style = getComputedStyle(element);
  const token = (name: string) => parseHex(style.getPropertyValue(name));
  return {
    paper: token("--paper"),
    graticule: token("--graticule"),
    echoes: [
      token("--echo-1"),
      token("--echo-2"),
      token("--echo-3"),
      token("--echo-4"),
      token("--echo-5"),
      token("--echo-6"),
    ],
  };
}

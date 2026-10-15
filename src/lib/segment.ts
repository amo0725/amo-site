/**
 * Splits mixed Chinese/English text into words. Runs on the server at build
 * time, so the browser only receives finished spans.
 */
export function segmentWords(text: string, locale = "zh-Hant"): string[] {
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

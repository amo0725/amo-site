import { segmentWords } from "@/lib/segment";

interface ScrubTextProps {
  text: string;
  /** Locale used to find word boundaries (Chinese has no spaces). */
  locale: string;
  className?: string;
}

/**
 * Paragraph whose words ink in as they scroll through the viewport.
 * Pure CSS scroll-driven animation: no JavaScript, no main-thread work.
 */
export function ScrubText({ text, locale, className }: ScrubTextProps) {
  const words = segmentWords(text, locale);
  return (
    <p className={className}>
      {words.map((word, i) =>
        word.trim() === "" ? (
          <span key={i}>{word}</span>
        ) : (
          <span key={i} className="scrub-word">
            {word}
          </span>
        ),
      )}
    </p>
  );
}

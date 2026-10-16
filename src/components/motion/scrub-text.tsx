import { segmentWords } from "@/lib/segment";

interface ScrubTextProps {
  text: string;
  /** Locale used to find word boundaries (Chinese has no spaces). */
  locale: string;
  className?: string;
}

/**
 * Paragraphs whose words ink in as they scroll through the viewport.
 * A blank line in `text` starts a new paragraph, which gives a long
 * statement a place to pause. Pure CSS scroll-driven animation: no
 * JavaScript, no main-thread work.
 */
export function ScrubText({ text, locale, className }: ScrubTextProps) {
  const paragraphs = text.split(/\n\s*\n/);
  return (
    <div className={className}>
      {paragraphs.map((paragraph, p) => (
        <p key={p} className={p > 0 ? "mt-[0.9em]" : undefined}>
          {segmentWords(paragraph.trim(), locale).map((word, i) =>
            word.trim() === "" ? (
              <span key={i}>{word}</span>
            ) : (
              <span key={i} className="scrub-word">
                {word}
              </span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

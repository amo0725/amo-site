/**
 * Runs a tiny script during HTML parsing so client-only values (like the
 * local time) are in place before first paint. On the client the tag is
 * inert, which keeps React from warning about rendering scripts.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

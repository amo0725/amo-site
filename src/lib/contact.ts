import type { UiStrings } from "@/content/types";

/** "Email me": a blank message. */
export const writeHref = (email: string) => `mailto:${email}`;

/**
 * "Request my résumé": subject and a short body with [placeholders], so the
 * request arrives with what is needed to answer it (role, company, where,
 * which language) instead of an empty message.
 */
export const resumeHref = (email: string, ui: UiStrings["contact"]) =>
  `mailto:${email}?subject=${encodeURIComponent(ui.resumeSubject)}&body=${encodeURIComponent(ui.resumeBody)}`;

/** Profiles in the order recruiters look: LinkedIn, then the rest. */
export function profileLinks<T extends { label: string }>(
  links: readonly T[],
): T[] {
  return [...links].sort(
    (a, b) =>
      Number(b.label === "LinkedIn") - Number(a.label === "LinkedIn"),
  );
}

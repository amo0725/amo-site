import type { SiteContent, WorkEntry } from "../content/types";

/** The words on a case's share card. */
export interface CaseCard {
  /** Category and body of work, above the title. */
  kicker: string;
  title: string;
  /** The before → after figure, or the outcome when there is none. */
  figure: string;
  byline: string;
}

/**
 * What a case's share card says. Also read by scripts/og-font.mjs, which
 * cuts the Chinese face to exactly these characters, so keep this free of
 * runtime imports.
 */
export function caseCard(content: SiteContent, entry: WorkEntry): CaseCard {
  const track = content.experience.find((t) => t.id === entry.track);
  const metric = entry.metrics?.[0];
  const figure = metric
    ? `${metric.beforeText} → ${metric.afterText}${metric.factor ? ` (${metric.factor})` : ""}`
    : (entry.outcome ?? entry.steps.result);
  const sep = content.locale === "en" ? " · " : "・";
  return {
    kicker: [content.work.categories[entry.category], track?.short]
      .filter(Boolean)
      .join(sep),
    title: entry.title,
    figure,
    byline: `${content.profile.fullName}${sep}${content.profile.role}`,
  };
}

/** The words on the site's own card, under the name. */
export function homeCard(content: SiteContent) {
  const sep = content.locale === "en" ? " · " : "・";
  return {
    role: `${content.profile.role}${sep}${content.profile.place}`,
    positioning: content.profile.positioning,
  };
}

/** Every string on the cards, for the font script. */
export const cardText = (content: SiteContent, entry: WorkEntry) =>
  Object.values(caseCard(content, entry));

/** Every string on the site's own card, for the font script. */
export const homeText = (content: SiteContent) =>
  Object.values(homeCard(content));

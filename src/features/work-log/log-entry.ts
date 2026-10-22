import type { WorkEntry } from "@/content/types";

/**
 * What a row of the list needs: the rest of a case stays on the server
 * (its body arrives rendered), so it isn't shipped twice in the page data.
 */
export type WorkLogEntry = Pick<
  WorkEntry,
  "id" | "title" | "category" | "track" | "featured" | "outcome" | "metrics"
>;

/** The fields of a case the list needs, with only its first metric. */
export const toLogEntry = ({
  id,
  title,
  category,
  track,
  featured,
  outcome,
  metrics,
}: WorkEntry): WorkLogEntry => ({
  id,
  title,
  category,
  track,
  featured,
  outcome,
  metrics: metrics?.slice(0, 1),
});

import type { Locale, UiStrings, WorkEntry } from "@/content/types";

/** A case's own page, with the full write-up. */
export const caseHref = (locale: Locale, id: string) =>
  `/${locale}/work/${id}`;

/** In-page id of a case in the work log. */
export const caseAnchor = (id: string) => `case-${id}`;

/**
 * A case in four steps, symptom to result, as a short vertical track. The
 * steps rise in one after another when the case opens (.case-step), all
 * within half a second; at rest and with motion off they are simply there.
 */
export function CaseSteps({
  entry,
  ui,
  heading: Heading = "h4",
}: {
  entry: WorkEntry;
  ui: UiStrings["work"];
  /** The steps' label level: h4 under a case in the list, h2 on its page. */
  heading?: "h2" | "h4";
}) {
  const steps = [
    { key: "symptom", label: ui.symptom, text: entry.steps.symptom },
    { key: "cause", label: ui.cause, text: entry.steps.cause },
    { key: "fix", label: ui.fix, text: entry.steps.fix },
    { key: "result", label: ui.result, text: entry.steps.result },
  ];
  return (
    <ol className="case-steps grid gap-0 md:grid-cols-4 md:gap-5">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={step.key}
            className="case-step relative grid content-start grid-cols-[1.75rem_1fr] gap-x-3 pb-4 md:grid-cols-1 md:gap-y-2 md:pb-0"
            style={{ "--i": i } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className={`relative z-10 flex size-7 items-center justify-center rounded-full border-2 bg-paper text-xs font-bold tabular ${
                last ? "border-echo-2" : "border-ink"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <Heading className="text-xs font-semibold text-ink-soft">
                {step.label}
              </Heading>
              <p className={last ? "mt-0.5 font-semibold" : "mt-0.5"}>
                {step.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * What an open case shows in the list: the four steps, the lesson, and the
 * way to the full write-up. A server component, handed to the client list
 * as a finished node.
 */
export function CaseSummary({
  entry,
  ui,
  locale,
}: {
  entry: WorkEntry;
  ui: UiStrings["work"];
  locale: Locale;
}) {
  return (
    <div className="grid gap-6 pb-8 md:grid-cols-[7rem_1fr] md:gap-x-8">
      <div className="space-y-6 md:col-start-2">
        <CaseSteps entry={entry} ui={ui} />
        {entry.lesson ? (
          <blockquote className="max-w-[44rem] border-l-2 border-echo-2 pl-4 text-lg font-medium">
            <span className="sr-only">{ui.lesson}: </span>
            {entry.lesson}
          </blockquote>
        ) : null}
        <a
          href={caseHref(locale, entry.id)}
          className="inline-flex items-center gap-1.5 border-b border-control pb-0.5 text-sm font-semibold hover:border-ink"
        >
          {ui.readMore}
          <span className="sr-only">: {entry.title}</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

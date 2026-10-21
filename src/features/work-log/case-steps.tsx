import type { Locale, UiStrings, WorkEntry } from "@/content/types";

/** A case's own page, with the full write-up. */
export const caseHref = (locale: Locale, id: string) =>
  `/${locale}/work/${id}`;

/** In-page id of a case in the work log. */
export const caseAnchor = (id: string) => `case-${id}`;

/**
 * A case in four steps, symptom to result, plotted as four stations with
 * arrowed connectors; the result is the one filled (green) station. The
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
  /** The steps' label level: h4 under a case in the list, h3 on its page. */
  heading?: "h3" | "h4";
}) {
  const steps = [
    { key: "symptom", label: ui.symptom, text: entry.steps.symptom },
    { key: "cause", label: ui.cause, text: entry.steps.cause },
    { key: "fix", label: ui.fix, text: entry.steps.fix },
    { key: "result", label: ui.result, text: entry.steps.result },
  ];
  return (
    <ol className="case-steps grid gap-0 md:grid-cols-4 md:gap-x-8">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={step.key}
            className="case-step relative grid content-start grid-cols-[1.75rem_1fr] gap-x-3 pb-5 md:grid-cols-1 md:gap-y-3 md:pb-0"
            style={{ "--i": i } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className={last ? "node node-live" : "node"}
            >
              {i + 1}
            </span>
            <div>
              <Heading className="coord">{step.label}</Heading>
              <p
                className={
                  last
                    ? "mt-1 font-semibold md:max-w-[18em]"
                    : "mt-1 md:max-w-[18em]"
                }
              >
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
 * The lesson as an annotation: a coordinate label with its leader, then the
 * sentence by a green mark. In the list the label sits in the category
 * column; on a case page it heads the line.
 */
export function Lesson({
  text,
  label,
  inColumn = false,
}: {
  text: string;
  label: string;
  inColumn?: boolean;
}) {
  return (
    <figure
      className={
        inColumn
          ? "grid gap-2 md:col-span-2 md:grid-cols-[7rem_1fr] md:gap-x-8"
          : "grid gap-2"
      }
    >
      <figcaption className="coord flex items-center gap-2 md:pt-[0.35rem]">
        {label}
        <span aria-hidden="true" className="leader" />
      </figcaption>
      <blockquote className="flex gap-3">
        <span aria-hidden="true" className="mark mt-[0.55em] bg-echo-2" />
        <p className="max-w-[30em] text-lg font-semibold tracking-tight text-balance md:text-xl">
          {text}
        </p>
      </blockquote>
    </figure>
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
    <div className="grid gap-y-7 pb-9 md:grid-cols-[7rem_1fr] md:gap-x-8">
      <div className="md:col-start-2">
        <CaseSteps entry={entry} ui={ui} />
      </div>
      {entry.lesson ? (
        <Lesson text={entry.lesson} label={ui.lesson} inColumn />
      ) : null}
      <a href={caseHref(locale, entry.id)} className="go justify-self-start md:col-start-2">
        {ui.readMore}
        <span className="sr-only">: {entry.title}</span>
      </a>
    </div>
  );
}

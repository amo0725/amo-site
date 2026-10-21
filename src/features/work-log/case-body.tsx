import type { ReactNode } from "react";
import type { UiStrings, WorkEntry } from "@/content/types";
import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import { CaseFlows } from "./case-flows";
import { Lesson } from "./case-steps";

/** A write-up heading: a coordinate label with a rule to the column edge. */
function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="coord flex items-center gap-3 after:h-px after:flex-1 after:bg-graticule">
      {children}
    </h2>
  );
}

function Evidence({ lines }: { lines: readonly string[] }) {
  return (
    <InView threshold={0.4}>
      <ul className="space-y-2 text-sm tabular">
        {lines.map((line, i) => (
          <li
            key={line}
            className="evidence flex gap-3"
            style={{ "--i": i } as React.CSSProperties}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="mt-[0.15em] size-4 shrink-0 text-echo-2"
              fill="none"
              stroke="currentColor"
            >
              <rect
                className="evidence-box"
                x="1.5"
                y="1.5"
                width="13"
                height="13"
                pathLength={1}
                strokeWidth="1.5"
              />
              <path
                className="evidence-check"
                d="M4.5 8.5 L7 11 L11.5 5.5"
                pathLength={1}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {line}
          </li>
        ))}
      </ul>
    </InView>
  );
}

/**
 * The full write-up of one case, on its own page. The story runs down the
 * main column (problem, root cause, what was done, how the fix is shaped,
 * the result, the lesson); from lg the measurements, the evidence and the
 * stack sit in a rail beside it that stays in view while reading.
 */
export function CaseBody({
  entry,
  ui,
}: {
  entry: WorkEntry;
  ui: UiStrings["work"];
}) {
  return (
    <div className="case-page grid gap-12 lg:grid-cols-[minmax(0,44rem)_1fr_19rem] lg:gap-x-10">
      <div className="space-y-9">
        <p className="text-lg md:text-xl">{entry.problem}</p>
        {entry.cause ? (
          <section className="space-y-3">
            <Heading>{ui.cause}</Heading>
            <p>{entry.cause}</p>
          </section>
        ) : null}
        <section className="space-y-3">
          <Heading>{ui.actions}</Heading>
          <ul className="space-y-2">
            {entry.actions.map((action) => (
              <li key={action} className="flex gap-3">
                <span aria-hidden="true" className="leader mt-[0.85em]" />
                {action}
              </li>
            ))}
          </ul>
        </section>
        {entry.flows ? <CaseFlows flows={entry.flows} /> : null}
        {entry.result ? (
          <section className="space-y-3">
            <Heading>{ui.result}</Heading>
            <p>{entry.result}</p>
          </section>
        ) : null}
        {entry.lesson ? <Lesson text={entry.lesson} label={ui.lesson} /> : null}
      </div>

      <aside className="space-y-8 lg:sticky lg:top-8 lg:col-start-3 lg:self-start">
        {entry.metrics ? (
          <div className="space-y-4">
            <p className="coord">{ui.result}</p>
            <InView className="metric-play">
              <MetricBars
                metrics={entry.metrics}
                className="lg:[&_.metric]:grid-cols-1"
              />
            </InView>
          </div>
        ) : null}
        {entry.evidence ? <Evidence lines={entry.evidence} /> : null}
        <div className="space-y-2 border-t border-graticule pt-4">
          <p className="coord">{ui.stack}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            {entry.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </p>
        </div>
      </aside>
    </div>
  );
}

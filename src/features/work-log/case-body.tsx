import type { UiStrings, WorkEntry } from "@/content/types";
import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import { CaseFlows } from "./case-flows";

/**
 * The body of one case: problem, root cause, what was done, the result and
 * the lesson. A server component: the log hands it to the client list as a
 * finished node, so the list's own JavaScript stays small and each body
 * hydrates on its own.
 */
export function CaseBody({
  entry,
  ui,
}: {
  entry: WorkEntry;
  ui: UiStrings["work"];
}) {
  return (
    <div className="grid gap-6 pb-8 md:grid-cols-[7rem_1fr] md:gap-x-8">
      <div className="max-w-[44rem] space-y-5 md:col-start-2">
        <p className="text-lg">{entry.problem}</p>
        {entry.cause ? (
          <div>
            <h4 className="text-sm font-semibold text-ink-soft">{ui.cause}</h4>
            <p className="mt-1">{entry.cause}</p>
          </div>
        ) : null}
        <div>
          <h4 className="text-sm font-semibold text-ink-soft">{ui.actions}</h4>
          <ul className="mt-1 space-y-1.5">
            {entry.actions.map((action) => (
              <li key={action} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[0.8em] h-px w-3 shrink-0 bg-ink"
                />
                {action}
              </li>
            ))}
          </ul>
        </div>
        {entry.flows ? <CaseFlows flows={entry.flows} /> : null}
        {entry.result || entry.metrics || entry.evidence ? (
          <div>
            <h4 className="text-sm font-semibold text-ink-soft">{ui.result}</h4>
            {entry.metrics ? (
              entry.featured ? (
                <InView className="metric-play mt-3 mb-4">
                  <MetricBars metrics={entry.metrics} />
                </InView>
              ) : (
                <MetricBars
                  metrics={entry.metrics}
                  className="metric-play mt-3 mb-4"
                />
              )
            ) : null}
            {entry.result ? <p className="mt-1">{entry.result}</p> : null}
            {entry.evidence ? (
              <InView threshold={0.4}>
                <ul className="mt-3 space-y-1.5 tabular">
                  {entry.evidence.map((line, i) => (
                    <li
                      key={line}
                      className="evidence flex gap-3"
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className="mt-[0.2em] size-4 shrink-0 text-echo-2"
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
            ) : null}
          </div>
        ) : null}
        {entry.lesson ? (
          <blockquote className="border-l-2 border-echo-2 pl-4 text-lg font-medium">
            <span className="sr-only">{ui.lesson}: </span>
            {entry.lesson}
          </blockquote>
        ) : null}
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          {entry.stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

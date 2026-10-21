import type { UiStrings, WorkEntry } from "@/content/types";
import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import { CaseFlows } from "./case-flows";

/**
 * The full write-up of one case, on its own page: problem, root cause,
 * what was done, how the fix is shaped, the result with its measurements
 * and evidence, the lesson and the stack.
 */
export function CaseBody({
  entry,
  ui,
}: {
  entry: WorkEntry;
  ui: UiStrings["work"];
}) {
  return (
    <div className="case-page">
      <div className="max-w-[44rem] space-y-6">
        <p className="text-lg">{entry.problem}</p>
        {entry.cause ? (
          <div>
            <h2 className="text-sm font-semibold text-ink-soft">{ui.cause}</h2>
            <p className="mt-1">{entry.cause}</p>
          </div>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold text-ink-soft">{ui.actions}</h2>
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
            <h2 className="text-sm font-semibold text-ink-soft">{ui.result}</h2>
            {entry.metrics ? (
              <InView className="metric-play mt-3 mb-4">
                <MetricBars metrics={entry.metrics} />
              </InView>
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

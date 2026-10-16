import type { CaseFlow } from "@/content/types";

/**
 * A case's structure as labelled rows of boxes, read left to right. Plain
 * HTML (an ordered list per row), so it wraps on phones and reads as a
 * list to assistive tech; the arrows are decoration.
 */
export function CaseFlows({ flows }: { flows: readonly CaseFlow[] }) {
  return (
    <div className="space-y-5">
      {flows.map((flow) => (
        <figure key={flow.label}>
          <figcaption className="text-sm font-semibold text-ink-soft">
            {flow.label}
          </figcaption>
          <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
            {flow.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-sm border border-coast bg-paper-raised px-2.5 py-1 text-sm leading-snug">
                  {step}
                </span>
                {i < flow.steps.length - 1 ? (
                  <span aria-hidden="true" className="text-coast">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          {flow.note ? (
            <p className="mt-2 flex gap-2 text-sm text-ink-soft">
              <span
                aria-hidden="true"
                className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-echo-2"
              />
              {flow.note}
            </p>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

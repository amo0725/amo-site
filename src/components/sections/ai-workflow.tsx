import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { AiWorkflow, SectionCopy, UiStrings } from "@/content/types";

interface AiWorkflowProps {
  workflow: AiWorkflow;
  copy: SectionCopy;
  ui: UiStrings["ai"];
}

/** One lane of a step: who does what. A step with no part for one side shows only the other. */
function Lane({
  who,
  text,
  tone,
}: {
  who: string;
  text: string;
  tone: "me" | "agent";
}) {
  return (
    <div
      className={`grid grid-cols-[3.25rem_1fr] gap-x-2 gap-y-0.5 border-l-2 px-2.5 py-1 text-left text-sm lg:grid-cols-1 lg:py-1.5 ${
        tone === "me" ? "border-echo-4" : "border-echo-1"
      }`}
    >
      <span className="pt-0.5 text-xs font-semibold text-ink-soft lg:pt-0">
        {who}
      </span>
      <span>{text}</span>
    </div>
  );
}

/**
 * The pipeline every change goes through, with who does what at each step:
 * me or the agent. As the section scrolls by, a signal fills the line and
 * each station lights up in turn (CSS scroll-driven animation on a shared
 * named timeline). Each step's full description is one tap away.
 */
export function AiWorkflowSection({ workflow, copy, ui }: AiWorkflowProps) {
  const meta = sectionMeta("ai");
  const steps = workflow.steps;
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule bg-surface-display px-5 py-16 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} lead={copy.lead}>
          {copy.label}
        </SectionHeading>
        <p className="mb-10 max-w-[40rem] text-lg font-semibold text-balance md:mb-14 md:text-xl">
          {workflow.headline}
        </p>

        <div
          className="pipe relative"
          style={{ "--steps": steps.length } as React.CSSProperties}
        >
          {/* Track and fill: vertical up to tablets, horizontal from lg up. */}
          <span
            aria-hidden="true"
            className="absolute top-5 bottom-5 left-5 w-px bg-graticule lg:hidden"
          >
            <span className="pipe-fill-y absolute inset-0 bg-echo-2" />
          </span>
          <span
            aria-hidden="true"
            className="absolute top-5 right-[8%] left-[8%] hidden h-px bg-graticule lg:block"
          >
            <span className="pipe-fill-x absolute inset-0 bg-echo-2" />
          </span>

          <ol className="relative grid gap-7 md:gap-10 lg:grid-cols-6 lg:gap-5">
            {steps.map((step, i) => (
              <li
                key={step.id}
                className="grid grid-cols-[2.5rem_1fr] gap-4 lg:grid-cols-1 lg:justify-items-center lg:text-center"
              >
                <span
                  className="pipe-dot relative z-10 flex size-10 items-center justify-center rounded-full border border-coast bg-paper-raised text-sm font-bold tabular"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {i + 1}
                </span>
                <div className="grid w-full content-start gap-2 lg:max-w-[15rem]">
                  <h3 className="text-lg font-bold lg:flex lg:min-h-[3.5rem] lg:items-center lg:justify-center">
                    {step.title}
                  </h3>
                  {step.me ? (
                    <Lane who={ui.me} text={step.me} tone="me" />
                  ) : null}
                  {step.agent ? (
                    <Lane who={ui.agent} text={step.agent} tone="agent" />
                  ) : null}
                  <details className="group/step text-left">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-sm font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
                      <span
                        aria-hidden="true"
                        className="transition-[rotate] duration-300 group-open/step:rotate-90"
                      >
                        ›
                      </span>
                      {ui.details}
                    </summary>
                    <p className="pt-1 text-sm text-ink-soft">{step.body}</p>
                  </details>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-graticule pt-6">
          <h3 className="text-sm font-semibold">{workflow.toolsLabel}</h3>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-ink-soft">
            {workflow.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

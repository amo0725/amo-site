import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { AiWorkflow, SectionCopy } from "@/content/types";

interface AiWorkflowProps {
  workflow: AiWorkflow;
  copy: SectionCopy;
}

/**
 * The pipeline every change goes through. As the section scrolls by, a
 * signal fills the line and each station lights up in turn (CSS
 * scroll-driven animation on a shared named timeline).
 */
export function AiWorkflowSection({ workflow, copy }: AiWorkflowProps) {
  const meta = sectionMeta("ai");
  const steps = workflow.steps;
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule px-5 py-16 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} lead={copy.lead}>
          {copy.label}
        </SectionHeading>
        <p className="mb-10 max-w-[40rem] md:mb-14 md:text-lg">{workflow.intro}</p>

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
                  className="pipe-dot relative z-10 flex size-10 items-center justify-center rounded-full border border-coast bg-paper text-sm font-bold tabular"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-ink-soft lg:mx-auto lg:max-w-[14rem]">
                    {step.body}
                  </p>
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

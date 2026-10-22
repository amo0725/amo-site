import { SectionHeading } from "@/components/ui/section-heading";
import { Fold } from "@/components/ui/fold";
import { sectionMeta } from "@/config/site";
import type { AiWorkflow, SectionCopy, UiStrings } from "@/content/types";

interface AiWorkflowProps {
  workflow: AiWorkflow;
  copy: SectionCopy;
  ui: UiStrings["ai"];
}

/** Grid column of each station from lg (column 1 holds the lane names). */
const STEP_COLUMN = [
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
  "lg:col-start-7",
];

const LANE_COLOR = { me: "var(--echo-4)", agent: "var(--echo-1)" } as const;

/** A lane's name with its colour mark. */
function LaneLabel({ who, tone }: { who: string; tone: "me" | "agent" }) {
  return (
    <span className="coord flex items-center gap-2">
      <span
        aria-hidden="true"
        className="mark"
        style={{ background: LANE_COLOR[tone] }}
      />
      {who}
    </span>
  );
}

/**
 * One cell of a lane: what this side does at this step. On phones each
 * cell names its lane; from lg the lane names sit once in the first
 * column and a cell with no part shows a dash, so the row reads straight
 * across. Phones skip the empty cell.
 */
function LaneCell({
  who,
  text,
  tone,
}: {
  who: string;
  text?: string;
  tone: "me" | "agent";
}) {
  const edge =
    tone === "me"
      ? "border-t border-graticule lg:border-control"
      : "border-t border-graticule lg:border-b lg:border-b-control";
  if (!text) {
    return (
      <div
        aria-hidden="true"
        className={`hidden items-center py-3 lg:flex ${edge}`}
      >
        <span className="leader" />
      </div>
    );
  }
  return (
    <div
      className={`grid grid-cols-[4.75rem_1fr] gap-x-2 py-2.5 text-sm lg:block lg:py-3 lg:pr-5 ${edge}`}
    >
      <span className="lg:sr-only">
        <LaneLabel who={who} tone={tone} />
      </span>
      <span>{text}</span>
    </div>
  );
}

/**
 * The pipeline every change goes through, drawn as a lane chart: the six
 * stations on an axis, then two lanes, me and the agent, read straight
 * across (a CSS subgrid keeps every column's rows level). Phones stack the
 * stations on a vertical rail. As the section scrolls by, the rail fills
 * and each station lights up in turn (scroll-driven, on a shared named
 * timeline). Each step's full description is one tap away.
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
          {/* The rail on phones and tablets; from lg each station draws
              its own connector to the next. */}
          <span
            aria-hidden="true"
            className="absolute top-3.5 bottom-3.5 left-[13px] w-[1.5px] bg-control lg:hidden"
          >
            <span className="pipe-fill-y absolute inset-0 bg-echo-2" />
          </span>

          <ol className="relative grid gap-8 lg:grid-cols-[5.5rem_repeat(6,minmax(0,1fr))] lg:grid-rows-[auto_auto_auto_auto_auto] lg:gap-0">
            {/* Lane names, once, in the first column (lg). */}
            <li
              aria-hidden="true"
              className="hidden border-t border-control py-3 lg:col-start-1 lg:row-start-3 lg:block"
            >
              <LaneLabel who={ui.me} tone="me" />
            </li>
            <li
              aria-hidden="true"
              className="hidden border-t border-b border-graticule border-b-control py-3 lg:col-start-1 lg:row-start-4 lg:block"
            >
              <LaneLabel who={ui.agent} tone="agent" />
            </li>
            {steps.map((step, i) => (
              <li
                key={step.id}
                className={`pipe-stop relative grid grid-cols-[1.75rem_1fr] gap-x-4 lg:row-span-5 lg:row-start-1 lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-x-0 ${STEP_COLUMN[i] ?? ""}`}
              >
                <span
                  className="node pipe-dot row-span-5 lg:row-span-1 lg:mb-4"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {i + 1}
                </span>
                <h3 className="pt-[0.15rem] text-lg leading-tight font-bold lg:pt-0 lg:pr-5 lg:pb-4 lg:text-base">
                  {step.title}
                </h3>
                <div className="col-start-2 mt-2 lg:col-start-1 lg:mt-0 lg:contents">
                  <LaneCell who={ui.me} text={step.me} tone="me" />
                  <LaneCell who={ui.agent} text={step.agent} tone="agent" />
                </div>
                <Fold
                  className="col-start-2 mt-1 border-t border-graticule lg:col-start-1 lg:mt-3 lg:mr-5"
                  summaryClassName="min-h-11 py-1 text-sm font-semibold"
                  summary={
                    <span>
                      {ui.details}
                      <span className="sr-only">: {step.title}</span>
                    </span>
                  }
                >
                  <p className="pb-2 text-sm text-ink-soft">{step.body}</p>
                </Fold>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-graticule pt-6">
          <h3 className="coord">{workflow.toolsLabel}</h3>
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

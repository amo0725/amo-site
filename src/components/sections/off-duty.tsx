import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  OffDuty as OffDutyContent,
  SectionCopy,
  UiStrings,
} from "@/content/types";
import { FrametimeChart } from "@/features/frametime/frametime-chart";
import { RevMeter } from "@/features/rev-meter/rev-meter";

interface OffDutyProps {
  content: OffDutyContent;
  copy: SectionCopy;
  ui: UiStrings["offDuty"];
}

export function OffDuty({ content, copy, ui }: OffDutyProps) {
  const meta = sectionMeta("off-duty");
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

        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <article className="@container md:col-span-6">
            <RevMeter name={content.sim.name} note={content.sim.note} ui={ui} />
          </article>

          <article className="md:col-span-6">
            <h3 className="text-xl font-extrabold font-expanded md:text-2xl">
              {content.rig.title}
            </h3>
            <p className="mt-2 max-w-[30rem]">
              {content.rig.note}
            </p>
            <details className="group/rig mt-6 border-t border-graticule">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {ui.details}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none font-light text-ink-soft transition-transform duration-300 group-open/rig:rotate-45"
                >
                  +
                </span>
              </summary>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {content.rig.specs.map((spec) => (
                  <div key={spec.label} className="contents">
                    <dt className="text-ink-soft">{spec.label}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10">
                <FrametimeChart ui={ui} />
              </div>
            </details>
          </article>
        </div>
      </div>
    </section>
  );
}

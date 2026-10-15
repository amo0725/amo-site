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
      className="border-t border-graticule px-5 py-24 md:px-10 md:py-32"
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
            <h3 className="text-xl font-bold font-expanded">
              {content.rig.title}
            </h3>
            <p className="mt-2 max-w-[30rem] text-ink-soft">
              {content.rig.note}
            </p>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-graticule pt-5 text-sm">
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
          </article>
        </div>
      </div>
    </section>
  );
}

import { PhoneFold } from "@/components/ui/phone-fold";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  GraphLayout,
  SectionCopy,
  SkillGroup,
  SystemEdge,
  SystemNode,
  UiStrings,
} from "@/content/types";
import { IntegrationMap } from "@/features/integration-map/integration-map";

interface SystemsProps {
  nodes: readonly SystemNode[];
  edges: readonly SystemEdge[];
  skills: readonly SkillGroup[];
  wide: GraphLayout;
  narrow: GraphLayout;
  copy: SectionCopy;
  ui: UiStrings["systems"];
}

export function Systems({
  nodes,
  edges,
  skills,
  wide,
  narrow,
  copy,
  ui,
}: SystemsProps) {
  const meta = sectionMeta("systems");
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule px-5 pt-16 md:px-10 md:pt-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} lead={copy.lead}>
          {copy.label}
        </SectionHeading>
        <IntegrationMap
          nodes={nodes}
          edges={edges}
          wide={wide}
          narrow={narrow}
          ui={ui}
        />
      </div>

      <div className="-mx-5 mt-14 border-t border-graticule px-5 py-10 md:-mx-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-[90rem]">
          <h3 className="mb-6 text-sm font-semibold">{ui.skillsTitle}</h3>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group, i) => {
              const items = (
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
              // The first tier is the headline; on phones the others fold.
              return i === 0 ? (
                <div key={group.label}>
                  <h4 className="text-sm font-semibold">{group.label}</h4>
                  {items}
                </div>
              ) : (
                <PhoneFold
                  key={group.label}
                  className="-mt-4 border-b border-graticule md:mt-0 md:border-0"
                  summaryClassName="flex items-center justify-between py-3 text-sm font-semibold md:py-0"
                  summary={group.label}
                >
                  <div className="pb-3 md:pb-0">{items}</div>
                </PhoneFold>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

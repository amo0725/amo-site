import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  SectionCopy,
  UiStrings,
  WorkCategory,
  WorkEntry,
} from "@/content/types";
import { type TrackOption, WorkLog } from "@/features/work-log/work-log";

interface WorkProps {
  entries: readonly WorkEntry[];
  tracks: readonly TrackOption[];
  categories: Readonly<Record<WorkCategory, string>>;
  colors: Readonly<Record<WorkCategory, string>>;
  copy: SectionCopy;
  ui: UiStrings["work"];
}

export function Work({
  entries,
  tracks,
  categories,
  colors,
  copy,
  ui,
}: WorkProps) {
  const meta = sectionMeta("work");
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="sticky-heading lg:sticky lg:top-24">
            <SectionHeading
              id={meta.id}
              colorVar={meta.colorVar}
              lead={copy.lead}
            >
              {copy.label}
            </SectionHeading>
          </div>
        </div>
        <div className="lg:col-span-9">
          <WorkLog
            entries={entries}
            tracks={tracks}
            categories={categories}
            colors={colors}
            ui={ui}
          />
        </div>
      </div>
    </section>
  );
}

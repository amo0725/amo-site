import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type {
  Locale,
  SectionCopy,
  UiStrings,
  WorkCategory,
  WorkEntry,
} from "@/content/types";
import { InlineScript } from "@/components/ui/inline-script";
import { fill } from "@/lib/i18n";
import { CaseSummary } from "@/features/work-log/case-steps";
import { openCasesScript } from "@/features/work-log/open-cases";
import { toLogEntry } from "@/features/work-log/log-entry";
import { type TrackOption, WorkLog } from "@/features/work-log/work-log";

interface WorkProps {
  entries: readonly WorkEntry[];
  tracks: readonly TrackOption[];
  categories: Readonly<Record<WorkCategory, string>>;
  colors: Readonly<Record<WorkCategory, string>>;
  copy: SectionCopy;
  ui: UiStrings["work"];
  locale: Locale;
}

export function Work({
  entries,
  tracks,
  categories,
  colors,
  copy,
  ui,
  locale,
}: WorkProps) {
  const meta = sectionMeta("work");
  const featured = entries.filter((e) => e.featured).map((e) => e.id);
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="border-t border-graticule px-5 py-16 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="sticky-heading lg:sticky lg:top-24">
            <SectionHeading
              compact
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
            entries={entries.map(toLogEntry)}
            tracks={tracks}
            categories={categories}
            colors={colors}
            ui={ui}
            bodies={Object.fromEntries(
              entries.map((e) => [
                e.id,
                <CaseSummary
                  key={e.id}
                  entry={e}
                  ui={ui}
                  locale={locale}
                  context={{
                    category: categories[e.category],
                    color: colors[e.category],
                    track: tracks.find((t) => t.id === e.track)?.label,
                    featured: e.featured
                      ? fill(ui.featured, {
                          n: featured.indexOf(e.id) + 1,
                          of: featured.length,
                        })
                      : undefined,
                  }}
                />,
              ]),
            )}
          />
          <InlineScript html={openCasesScript} />
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Fold } from "@/components/ui/fold";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { SectionCopy, SideProject, UiStrings } from "@/content/types";

/**
 * The product itself: a screenshot of the real app (demo data), framed at
 * one shape so the list lines up (16:10; a shorter 2:1 crop of the top on
 * phones, where the frame is full width). A phone screen sits upright in the
 * middle of the frame. Information, not decoration: what the product looks
 * like is the evidence it exists.
 */
function Shot({
  shot,
  note,
}: {
  shot: NonNullable<SideProject["shot"]>;
  note: string;
}) {
  const phone = shot.device === "phone";
  return (
    <figure className="grid gap-2">
      <div className="relative aspect-[2/1] max-w-full overflow-hidden border border-graticule bg-surface-display md:aspect-[16/10]">
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes={phone ? "(min-width: 48rem) 14vw, 40vw" : "(min-width: 48rem) 40vw, 100vw"}
          className={
            phone
              ? "absolute top-[6%] left-1/2 h-[120%] w-auto -translate-x-1/2 rounded-xl border-4 border-ink object-cover object-top"
              : "size-full object-cover object-top-left"
          }
        />
      </div>
      {shot.demo ? (
        <figcaption className="text-xs text-ink-soft">{note}</figcaption>
      ) : null}
    </figure>
  );
}

/** "github.com/owner/repo" from a repository URL. */
function repoLabel(href: string) {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

interface ProjectsProps {
  projects: readonly SideProject[];
  copy: SectionCopy;
  ui: UiStrings["projects"];
}

export function Projects({ projects, copy, ui }: ProjectsProps) {
  const meta = sectionMeta("projects");
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

        <ul className="border-t border-graticule">
          {projects.map((project) => (
            <li
              key={project.id}
              className="group relative isolate grid gap-4 border-b border-graticule py-8 md:grid-cols-12 md:gap-8 md:py-12"
            >
              {/* Hover wash: wipes in from the left in the section's band colour. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -right-5 -left-5 -z-10 origin-left scale-x-0 bg-paper-raised transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 md:-right-10 md:-left-10"
              />
              <div className="md:col-span-5">
                {project.shot ? (
                  <Shot shot={project.shot} note={ui.shotNote} />
                ) : null}
              </div>
              <div className="md:col-span-7">
                <h3 className="text-2xl leading-tight font-extrabold md:text-4xl">
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener"
                      className="underline decoration-coast decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink"
                    >
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
                  {project.alias ? <span>{project.alias}</span> : null}
                  {project.year ? (
                    <span className="tabular">{project.year}</span>
                  ) : null}
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener"
                      className="group/repo inline-flex items-center gap-1 rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold text-ink"
                    >
                      {repoLabel(project.href)}
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover/repo:translate-x-0.5 group-hover/repo:-translate-y-0.5"
                      >
                        ↗
                      </span>
                    </a>
                  ) : null}
                  {project.status ? (
                    <span className="rounded-full border border-echo-4 px-2.5 py-0.5 text-xs font-semibold text-ink">
                      {project.status}
                    </span>
                  ) : null}
                </p>
                <p className="mt-4 max-w-[40rem] md:text-lg">
                  {project.description}
                </p>
                {project.details.length > 0 ? (
                  <Fold
                    className="mt-3 max-w-[40rem] md:mt-4"
                    summaryClassName="border-y border-graticule py-3 text-sm font-semibold"
                    summary={ui.details}
                  >
                    <ul className="mt-3 space-y-1.5 text-ink-soft">
                      {project.details.map((d) => (
                        <li key={d} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[0.75em] h-px w-3 shrink-0 bg-coast"
                          />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </Fold>
                ) : null}
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  {project.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

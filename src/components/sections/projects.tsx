import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { SectionCopy, SideProject } from "@/content/types";
import { ProjectVisualView } from "./project-visuals";

/** "github.com/owner/repo" from a repository URL. */
function repoLabel(href: string) {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

interface ProjectsProps {
  projects: readonly SideProject[];
  copy: SectionCopy;
}

export function Projects({ projects, copy }: ProjectsProps) {
  const meta = sectionMeta("projects");
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

        <ul className="border-t border-graticule">
          {projects.map((project, i) => (
            <li
              key={project.id}
              className="group relative isolate grid gap-6 border-b border-graticule py-10 md:grid-cols-12 md:gap-8 md:py-12"
            >
              {/* Hover wash: wipes in from the left in the section's band colour. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -right-5 -left-5 -z-10 origin-left scale-x-0 bg-paper-raised transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 md:-right-10 md:-left-10"
              />
              <div className="size-24 md:col-span-2 md:size-auto md:max-w-32">
                <div className="aspect-square">
                  <ProjectVisualView visual={project.visual} seed={i * 7 + 3} />
                </div>
              </div>
              <div className="md:col-span-5">
                <h3 className="text-3xl leading-tight font-extrabold md:text-4xl">
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
              </div>
              <div className="max-w-[34rem] md:col-span-5">
                <p className="text-lg">{project.description}</p>
                {project.details.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 text-ink-soft">
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

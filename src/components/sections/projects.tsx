import Image from "next/image";
import { Fold } from "@/components/ui/fold";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { SectionCopy, SideProject, UiStrings } from "@/content/types";

/**
 * The product itself, on a plate: a screenshot of the real app in a frame
 * with corner ticks, one shape for every project (16:10; a shorter 2:1 crop
 * of the top on phones, where the plate is full width), and a caption row
 * "FIG. 01 · demo data". A phone screen stands upright in the middle.
 */
function Plate({
  shot,
  index,
  note,
}: {
  shot: NonNullable<SideProject["shot"]>;
  index: number;
  note: string;
}) {
  const phone = shot.device === "phone";
  return (
    <figure>
      <div className="plate">
        <div className="relative aspect-[2/1] max-w-full overflow-hidden bg-surface-display outline outline-1 -outline-offset-1 outline-graticule md:aspect-[16/10]">
          <Image
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            sizes={
              phone
                ? "(min-width: 48rem) 14vw, 40vw"
                : "(min-width: 48rem) 40vw, 100vw"
            }
            className={
              phone
                ? "absolute top-[7%] left-1/2 h-[125%] w-auto -translate-x-1/2 rounded-[0.9rem] border-[3px] border-ink object-cover object-top"
                : "size-full object-cover object-top-left"
            }
          />
        </div>
      </div>
      <figcaption className="coord mt-2 flex items-center justify-between gap-3">
        <span>FIG. {String(index + 1).padStart(2, "0")}</span>
        {shot.demo ? <span>{note}</span> : null}
      </figcaption>
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

/**
 * Side projects as a column of plates with their notes: the screenshot is
 * the evidence, the name and one line say what it is, how it is built is a
 * tap away. Titles stay below the section heading's size.
 */
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
          {projects.map((project, i) => (
            <li
              key={project.id}
              className="group pen-row grid gap-6 border-b border-graticule py-10 md:grid-cols-12 md:gap-10 md:py-14"
            >
              <div className="md:col-span-5">
                {project.shot ? (
                  <Plate shot={project.shot} index={i} note={ui.shotNote} />
                ) : null}
              </div>
              <div className="md:col-span-7 md:pt-1">
                <h3 className="text-2xl leading-[1.05] font-extrabold font-expanded md:text-[2rem]">
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener"
                      className="group/name inline-flex items-baseline gap-2 hover:text-ink-soft"
                    >
                      {project.name}
                      <span
                        aria-hidden="true"
                        className="text-xl text-ink-soft transition-transform group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5"
                      >
                        ↗
                      </span>
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="coord mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {project.status ? (
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="mark"
                        style={{ background: "var(--echo-4)" }}
                      />
                      {project.status}
                    </span>
                  ) : null}
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener"
                      className="normal-case underline decoration-control underline-offset-4 hover:text-ink"
                    >
                      {repoLabel(project.href)}
                    </a>
                  ) : null}
                  {project.alias && project.alias !== project.name ? (
                    <span className="normal-case">{project.alias}</span>
                  ) : null}
                  {project.year ? <span>{project.year}</span> : null}
                </p>
                <p className="mt-4 max-w-[40rem] md:text-lg">
                  {project.description}
                </p>
                {project.details.length > 0 ? (
                  <Fold
                    className="mt-5 max-w-[40rem]"
                    summaryClassName="border-y border-graticule py-3 text-sm font-semibold"
                    summary={ui.details}
                  >
                    <ul className="mt-3 space-y-1.5 text-ink-soft">
                      {project.details.map((d) => (
                        <li key={d} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="leader mt-[0.85em]"
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

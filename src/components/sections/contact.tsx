import { CopyEmailButton } from "@/components/ui/copy-email-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { ContactInfo, SectionCopy, UiStrings } from "@/content/types";

interface ContactProps {
  contact: ContactInfo;
  copy: SectionCopy;
  ui: UiStrings["contact"];
}

/**
 * The page ends on an ink panel that opens like a radar ring from the
 * bottom edge as you scroll into it (CSS, see .ring-open).
 */
export function Contact({ contact, copy, ui }: ContactProps) {
  const meta = sectionMeta("contact");
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="relative isolate"
    >
      <div
        aria-hidden="true"
        className="ring-open absolute inset-0 -z-10 bg-ink"
      />
      <div className="mx-auto max-w-[90rem] px-5 pt-28 pb-16 text-paper md:px-10 md:pt-40">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} inverted>
          {copy.label}
        </SectionHeading>

        <p className="max-w-[16em] text-[clamp(2.25rem,7vw,5.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-expanded">
          {ui.headline}
        </p>

        <p className="mt-8 text-lg">
          <a
            href={`mailto:${contact.email}`}
            className="underline decoration-paper/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-paper"
          >
            {contact.email}
          </a>
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex h-14 items-center rounded-full bg-paper px-8 text-lg font-semibold text-ink transition-transform active:scale-95"
          >
            {ui.write}
          </a>
          <CopyEmailButton
            email={contact.email}
            labels={{ idle: ui.copy, copied: ui.copied, failed: ui.copyFailed }}
            className="h-14 rounded-full border border-paper/40 px-7 text-lg transition-colors hover:border-paper"
          />
        </div>

        {contact.links.length > 0 ? (
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-lg">
            {contact.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-2 underline decoration-paper/40 underline-offset-4 hover:decoration-paper"
                  rel="me noopener"
                  target="_blank"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

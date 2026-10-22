import { CopyEmailButton } from "@/components/ui/copy-email-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { ContactInfo, SectionCopy, UiStrings } from "@/content/types";
import { profileLinks, resumeHref, writeHref } from "@/lib/contact";

interface ContactProps {
  contact: ContactInfo;
  copy: SectionCopy;
  ui: UiStrings["contact"];
}

/**
 * The page ends on the closing panel (--closing: ink in light mode, a raised dark surface in dark mode) that opens like a radar ring from the
 * bottom edge as you scroll into it (CSS, see .ring-open).
 */
export function Contact({ contact, copy, ui }: ContactProps) {
  const meta = sectionMeta("contact");
  const links = profileLinks(contact.links);
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className="relative isolate"
    >
      <div
        aria-hidden="true"
        // One pixel past the bottom: the footer below rounds separately.
        className="ring-open absolute inset-x-0 top-0 -bottom-px -z-10 bg-closing"
      />
      <div className="mx-auto max-w-[90rem] px-5 pt-28 pb-16 text-on-closing md:px-10 md:pt-40">
        <SectionHeading id={meta.id} colorVar={meta.colorVar} inverted>
          {copy.label}
        </SectionHeading>

        {/* Han glyphs need more leading than the expanded Latin face, and
            keep-all stops a break inside a word like 「哪裡」. */}
        <p className="max-w-[16em] text-[clamp(2.25rem,7vw,5.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance font-expanded [word-break:keep-all] [:lang(zh)_&]:leading-[1.25]">
          {ui.headline}
        </p>

        <p className="mt-6 max-w-[36rem] text-lg text-on-closing/80">
          {ui.status}
        </p>

        {/* The address as text to select or copy (mail links do nothing
            for readers without a mail app), then two ways to write: a
            blank message, or a résumé request that arrives with what is
            needed to answer it. LinkedIn first among the profiles: it is
            where recruiters look. */}
        <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 text-lg">
          <span className="font-semibold tabular select-all">
            {contact.email}
          </span>
          <CopyEmailButton
            email={contact.email}
            labels={{ idle: ui.copy, copied: ui.copied, failed: ui.copyFailed }}
            className="inline-flex min-h-11 items-center text-base text-on-closing/80 underline decoration-on-closing/40 underline-offset-4 transition-colors hover:text-on-closing hover:decoration-on-closing"
          />
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-4">
          <a
            href={writeHref(contact.email)}
            className="inline-flex h-14 items-center rounded-full bg-on-closing px-8 text-lg font-semibold text-closing transition-transform active:scale-95"
          >
            {ui.write}
          </a>
          <a
            href={resumeHref(contact.email, ui)}
            className="inline-flex h-14 items-center rounded-full border border-on-closing/40 px-7 text-lg transition-colors hover:border-on-closing"
          >
            {ui.resume}
          </a>
          {links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-7 gap-y-1 text-lg md:ml-4">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex min-h-11 items-center gap-2"
                    rel="me noopener"
                    target="_blank"
                  >
                    <span className="underline decoration-on-closing/40 underline-offset-4 group-hover:decoration-on-closing">
                      {link.label}
                    </span>
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
      </div>
    </section>
  );
}

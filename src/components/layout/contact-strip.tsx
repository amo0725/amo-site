import type { SiteContent } from "@/content/types";
import { profileLinks, resumeHref, writeHref } from "@/lib/contact";

/**
 * The end of a detail page, before the footer: who to write to and how,
 * on the same closing panel as the home page's contact section. A shared
 * case is often the only page a reader sees, so the way to act on it is
 * here, not one page away.
 */
export function ContactStrip({ content }: { content: SiteContent }) {
  const { ui, contact, sections } = content;
  const links = profileLinks(contact.links);
  return (
    <section
      aria-labelledby="contact-strip-title"
      className="bg-closing px-5 pt-16 pb-6 text-on-closing md:px-10 md:pt-24"
    >
      <div className="mx-auto grid max-w-[90rem] gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <h2
            id="contact-strip-title"
            className="coord flex items-center gap-3 text-on-closing/75"
          >
            <span
              aria-hidden="true"
              className="mark"
              style={{ background: "var(--band-9)" }}
            />
            {sections.contact.label}
          </h2>
          <p className="mt-4 max-w-[18em] text-2xl leading-[1.2] font-extrabold text-balance md:text-4xl [:lang(zh)_&]:leading-[1.35]">
            {ui.contact.headline}
          </p>
          <p className="mt-4 max-w-[36rem] text-on-closing/80">
            {ui.contact.status}
          </p>
          <p className="mt-3 font-semibold tabular select-all">
            {contact.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:col-span-6 lg:justify-end">
          <a
            href={writeHref(contact.email)}
            className="inline-flex h-12 items-center rounded-full bg-on-closing px-6 font-semibold text-closing transition-transform active:scale-95"
          >
            {ui.contact.write}
          </a>
          <a
            href={resumeHref(contact.email, ui.contact)}
            className="inline-flex h-12 items-center rounded-full border border-on-closing/40 px-6 transition-colors hover:border-on-closing"
          >
            {ui.contact.resume}
          </a>
          <ul className="flex flex-wrap gap-x-6">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  rel="me noopener"
                  target="_blank"
                  className="group inline-flex min-h-11 items-center gap-1.5"
                >
                  <span className="underline decoration-on-closing/40 underline-offset-4 group-hover:decoration-on-closing">
                    {link.label}
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

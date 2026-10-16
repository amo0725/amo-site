import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EchoLegend } from "@/components/layout/echo-legend";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AiWorkflowSection } from "@/components/sections/ai-workflow";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { OffDuty } from "@/components/sections/off-duty";
import { Principles } from "@/components/sections/principles";
import { Projects } from "@/components/sections/projects";
import { Reel } from "@/components/sections/reel";
import { Signal } from "@/components/sections/signal";
import { Systems } from "@/components/sections/systems";
import { Work } from "@/components/sections/work";
import { narrowLayout, wideLayout } from "@/config/graph-layouts";
import { categoryColor, sections, site } from "@/config/site";
import { getContent, isLocale } from "@/content";

/**
 * Composition root: the only place that knows where content comes from.
 * Every section receives its data through props.
 */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = getContent(lang);

  const nav = sections.map((s) => ({
    id: s.id,
    colorVar: s.colorVar,
    label: c.sections[s.key].nav,
  }));

  const github =
    c.contact.links.find((l) => l.label === "GitHub")?.href ??
    "https://github.com/amo0725";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.profile.fullName,
    alternateName: c.profile.nativeName,
    jobTitle: c.profile.role,
    url: `${site.url}/${lang}`,
    email: `mailto:${c.contact.email}`,
    address: { "@type": "PostalAddress", addressCountry: "TW" },
    knowsAbout: c.systems.skills.flatMap((g) => g.items).slice(0, 24),
    sameAs: c.contact.links.map((l) => l.href),
  };

  return (
    <>
      <div id="top" />
      <SiteHeader
        name={c.profile.name}
        nav={nav}
        navLabel={c.ui.mainNav}
        menu={c.ui.menu}
        motion={{
          label: c.ui.hero.motionLabel,
          on: c.ui.hero.motionOn,
          off: c.ui.hero.motionOff,
        }}
        language={c.ui.switchLanguage}
      />
      <EchoLegend nav={nav} label={c.ui.sectionNav} />
      <main id="main">
        <Hero
          profile={c.profile}
          ui={c.ui.hero}
          caseCount={c.work.entries.length}
          githubHref={github}
        />
        {/* Suspense boundaries let React hydrate below-the-fold sections in separate, interruptible tasks. */}
        <Suspense fallback={null}>
          <Signal profile={c.profile} copy={c.sections.signal} locale={lang} />
        </Suspense>
        <Suspense fallback={null}>
          <Work
            entries={c.work.entries}
            tracks={c.experience.map((t) => ({ id: t.id, label: t.short }))}
            categories={c.work.categories}
            colors={categoryColor}
            copy={c.sections.work}
            ui={c.ui.work}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Experience
            tracks={c.experience}
            copy={c.sections.experience}
            ui={c.ui.experience}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Systems
            nodes={c.systems.nodes}
            edges={c.systems.edges}
            skills={c.systems.skills}
            wide={wideLayout}
            narrow={narrowLayout}
            copy={c.sections.systems}
            ui={c.ui.systems}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Principles principles={c.principles} copy={c.sections.principles} />
        </Suspense>
        <Suspense fallback={null}>
          <AiWorkflowSection workflow={c.ai} copy={c.sections.ai} />
        </Suspense>
        <Suspense fallback={null}>
          <Projects
            projects={c.projects}
            copy={c.sections.projects}
            ui={c.ui.projects}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Reel copy={c.reel} />
        </Suspense>
        <Suspense fallback={null}>
          <OffDuty
            content={c.offDuty}
            copy={c.sections.offDuty}
            ui={c.ui.offDuty}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Contact
            contact={c.contact}
            copy={c.sections.contact}
            ui={c.ui.contact}
          />
        </Suspense>
      </main>
      <SiteFooter profile={c.profile} ui={c.ui.footer} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

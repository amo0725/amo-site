/**
 * Content contracts. Sections depend on these shapes, never on the concrete
 * locale files, so copy can change (or move to a CMS) without touching UI
 * code. Everything here must stay serialisable: it crosses into Client
 * Components as props. Strings with `{name}` placeholders are filled with
 * `fill()` from lib/i18n.
 */

export type Locale = "zh-TW" | "en";

export interface Profile {
  /** Short display name, used in the header. */
  name: string;
  fullName: string;
  /** Name in Chinese characters, shown next to the full name. */
  nativeName: string;
  /** Title as it appears on the résumé, e.g. "Full-stack engineer". */
  role: string;
  /** What the role leans towards, shown after the title. */
  specialty: string;
  place: string;
  /** Bold lead-in before the summary, e.g. "Full-stack engineer in Taiwan." */
  headline: string;
  /** Full text of the hero heading for assistive tech. */
  a11yName: string;
  timeZone: string;
  /** Main stack in one line, shown under the hero summary. */
  focus: string;
  /** The hero headline: one sentence of positioning. */
  positioning: string;
  /** Two or three sentences of evidence (meta description, About). */
  summary: string;
  /** Three proof points under the hero headline: a figure and what it measures. */
  /** `short` is the phone label, under the figure in a three-column strip. */
  proof: readonly { figure: string; label: string; short: string }[];
  /** Long-form statement revealed word by word on scroll. */
  statement: string;
  /** Secondary note shown after the statement. */
  aside: string;
}

export interface SiteLink {
  label: string;
  href: string;
}

export interface ContactInfo {
  email: string;
  links: readonly SiteLink[];
}

/* ---------- Experience ---------- */

/** A real before → after measurement. before/after share one unit. */
export interface Metric {
  label: string;
  before: number;
  after: number;
  beforeText: string;
  afterText: string;
  /** e.g. "143×"; omitted when it would overstate an approximate figure. */
  factor?: string;
}

/** One area of ownership inside a body of work. */
export interface ScopeArea {
  title: string;
  body: string;
  metric?: Metric;
  /** What the work protected, removed or made impossible. May carry a number; not a measurement. */
  impact?: string;
}

/**
 * A body of work, described by domain rather than by employer name, and
 * deliberately without dates: the site presents what was built and owned.
 */
export interface ExperienceTrack {
  id: string;
  /** Short label used for the work-log filter, e.g. "Messaging platform". */
  short: string;
  /** Anonymised description of the company: market and product, never the name. */
  domain: string;
  /** Scale and setting in one line: users, region, team. */
  context: string;
  role: string;
  summary: string;
  areas: readonly ScopeArea[];
  stack: readonly string[];
  /** Shown in the compact "earlier" group instead of in full. */
  earlier?: boolean;
}

/* ---------- Integration map ---------- */

export type SystemKind = "hub" | "service";

export interface SystemNode {
  id: string;
  label: string;
  kind: SystemKind;
  /** Short line shown when the node is selected. */
  note: string;
}

export interface SystemEdge {
  from: string;
  to: string;
  /** What actually flows across this connection. */
  flow: string;
}

export interface Point {
  x: number;
  y: number;
}

/** Node coordinates for one viewport shape, in viewBox units. */
export interface GraphLayout {
  viewBox: { width: number; height: number };
  positions: Readonly<Record<string, Point>>;
}

export interface SkillGroup {
  label: string;
  items: readonly string[];
}

/* ---------- Work log ---------- */

/** One labelled row of a case diagram: steps in order, plus an optional rule under it. */
export interface CaseFlow {
  label: string;
  steps: readonly string[];
  note?: string;
}

export type WorkCategory =
  "incident" | "payments" | "integration" | "architecture" | "data" | "product";

export interface WorkEntry {
  id: string;
  title: string;
  category: WorkCategory;
  /** ExperienceTrack id, used for the second filter. */
  track: string;
  problem: string;
  cause?: string;
  actions: readonly string[];
  result?: string;
  /** Measured before → after; the first one also shows on the collapsed row. */
  metrics?: readonly Metric[];
  /** Short result for the collapsed row when there is no measurement. */
  outcome?: string;
  /** Open by default: the cases to read first. */
  featured?: boolean;
  /** How the fix is shaped, as labelled flows of steps (drawn left to right). */
  flows?: readonly CaseFlow[];
  /** How the result was verified, one check per line. */
  evidence?: readonly string[];
  lesson?: string;
  stack: readonly string[];
}

/* ---------- Principles & AI workflow ---------- */

export interface Principle {
  id: string;
  title: string;
  body: string;
}

export interface PipelineStep {
  id: string;
  title: string;
  body: string;
}

export interface AiWorkflow {
  intro: string;
  steps: readonly PipelineStep[];
  toolsLabel: string;
  tools: readonly string[];
}

/* ---------- Side projects ---------- */

export type ProjectVisual = "radar" | "grid" | "tiles" | "contour" | "layers";

export interface SideProject {
  id: string;
  name: string;
  alias?: string;
  year?: string;
  /** e.g. "Planned" for work that has a spec but no build yet. */
  status?: string;
  /** Public source link. Private repositories are described but not linked. */
  href?: string;
  description: string;
  details: readonly string[];
  stack: readonly string[];
  visual: ProjectVisual;
}

/* ---------- Off duty ---------- */

export interface SpecRow {
  label: string;
  value: string;
}

export interface OffDuty {
  /** The hold-to-rev gauge: what he drives off duty. */
  sim: { name: string; note: string };
  rig: { title: string; note: string; specs: readonly SpecRow[] };
}

/* ---------- Showreel ---------- */

/** The shapes the reel's one recurring element takes. */
export type SignalStateName = "dot" | "packet" | "inbox" | "pen" | "gate" | "bar";

/** The "how it's made" panel under the reel. */
export interface ReelMaking {
  label: string;
  concept: string;
  mapLabel: string;
  states: Readonly<Record<SignalStateName, string>>;
  rulesLabel: string;
  rules: readonly string[];
  avoidLabel: string;
  avoid: readonly string[];
  build: string;
  download: string;
  downloadMeta: string;
}

export interface ReelCopy {
  title: string;
  lead: string;
  /** Plain-text summary of the reel for assistive tech. */
  summary: string;
  play: string;
  pause: string;
  replay: string;
  fullscreen: string;
  scrubber: string;
  chaptersLabel: string;
  chapters: readonly { id: string; title: string; at: number }[];
  s1: { line: string; sub: string };
  s2: {
    nodes: readonly [string, string, string, string];
    check: string;
    line: string;
  };
  s3: {
    channels: readonly [string, string, string];
    inbox: string;
    services: readonly [string, string, string];
    line: string;
  };
  s4: {
    socket: string;
    events: string;
    stalled: string;
    looks: string;
    broken: string;
    fix: string;
  };
  s5: { role: string; tagline: string };
  making: ReelMaking;
  /** Pre-rendered MP4 of this locale's reel, served from /public. */
  video: { src: string; poster: string };
}

/* ---------- Interface copy ---------- */

export interface UiStrings {
  skipLink: string;
  mainNav: string;
  sectionNav: string;
  contactShort: string;
  /** Section menu below the desktop breakpoint. */
  menu: { open: string; close: string };
  /** Link to the other language. */
  switchLanguage: { label: string; href: string; hrefLang: Locale };
  hero: {
    timeLabel: string;
    /** {count} */
    ctaWork: string;
    ctaGithub: string;
    /** Quiet text link to the contact section. */
    ctaContact: string;
    motionLabel: string;
    motionOn: string;
    motionOff: string;
  };
  experience: {
    role: string;
    scope: string;
    stack: string;
    earlier: string;
    impact: string;
    /** {count} */
    more: string;
    /** Phone fold over an earlier job's bullet list. {count} */
    highlights: string;
    /** Phone fold with a track's team context and stack. */
    teamStack: string;
  };
  projects: {
    /** Phone fold over a project's build notes. */
    details: string;
  };
  systems: {
    emptyTitle: string;
    /** {nodes}, {edges} */
    emptyBody: string;
    flowsTo: string;
    reset: string;
    skillsTitle: string;
  };
  work: {
    /** Phone fold over the two filter rows. */
    filter: string;
    byType: string;
    byTrack: string;
    all: string;
    cause: string;
    actions: string;
    result: string;
    lesson: string;
  };
  offDuty: {
    hold: string;
    holdKeys: string;
    rpm: string;
    redline: string;
    ratioLabel: string;
    /** {ratio} */
    chartLabel: string;
    chart21: string;
    chart11: string;
    /** Summary of the fold holding the specs and the frame-time chart. */
    details: string;
  };
  contact: {
    headline: string;
    write: string;
    copy: string;
    copied: string;
    copyFailed: string;
    /** What kind of role I'm open to. */
    status: string;
    resume: string;
    /** Subject line of the résumé request email. */
    resumeSubject: string;
  };
  footer: { now: string; backToTop: string };
}

export interface SectionCopy {
  label: string;
  /** Short label for the header navigation. */
  nav: string;
  lead?: string;
}

export type SectionKey =
  | "signal"
  | "experience"
  | "systems"
  | "work"
  | "principles"
  | "ai"
  | "projects"
  | "offDuty"
  | "contact";

/** Everything one locale of the site needs. */
export interface SiteContent {
  locale: Locale;
  /** BCP 47 value for <html lang>. */
  htmlLang: string;
  ogLocale: string;
  meta: { title: string; description: string; ogAlt: string; ogRole: string };
  profile: Profile;
  ui: UiStrings;
  sections: Readonly<Record<SectionKey, SectionCopy>>;
  experience: readonly ExperienceTrack[];
  systems: {
    nodes: readonly SystemNode[];
    edges: readonly SystemEdge[];
    skills: readonly SkillGroup[];
  };
  work: {
    entries: readonly WorkEntry[];
    categories: Readonly<Record<WorkCategory, string>>;
  };
  principles: readonly Principle[];
  ai: AiWorkflow;
  projects: readonly SideProject[];
  offDuty: OffDuty;
  contact: ContactInfo;
  reel: ReelCopy;
}

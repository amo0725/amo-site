import { SectionHeading } from "@/components/ui/section-heading";
import { sectionMeta } from "@/config/site";
import type { Principle, SectionCopy } from "@/content/types";

interface PrinciplesProps {
  principles: readonly Principle[];
  copy: SectionCopy;
}

/**
 * Small line drawings, one per principle. They draw themselves in as their
 * card scrolls into view, and redraw on hover.
 */
const GLYPHS: Record<string, React.ReactNode> = {
  "root-cause": (
    <>
      <path
        pathLength="1"
        d="M6 10 L32 32 M6 24 L32 32 M6 40 L32 32 M6 54 L32 32"
      />
      <path pathLength="1" d="M32 32 H58" />
      <circle pathLength="1" cx="32" cy="32" r="4" />
    </>
  ),
  verify: (
    <>
      <path pathLength="1" d="M10 52 V38 M20 52 V28 M30 52 V34 M40 52 V20" />
      <circle pathLength="1" cx="42" cy="22" r="11" />
      <path pathLength="1" d="M50 30 L60 40" />
    </>
  ),
  tests: (
    <>
      <circle pathLength="1" cx="14" cy="32" r="7" />
      <circle pathLength="1" cx="50" cy="32" r="7" />
      <path pathLength="1" d="M22 32 H42 M36 26 L42 32 L36 38" />
      <path pathLength="1" d="M50 42 C 50 56, 14 56, 14 42" />
    </>
  ),
  money: (
    <>
      <path pathLength="1" d="M8 22 H56 M8 32 H56 M8 42 H56" />
      <path pathLength="1" d="M24 14 V50 M40 14 V50" />
      <path pathLength="1" d="M8 54 H56" />
    </>
  ),
  contracts: (
    <>
      <rect pathLength="1" x="8" y="16" width="48" height="32" rx="2" />
      <path pathLength="1" d="M8 18 L32 36 L56 18" />
    </>
  ),
  reuse: (
    <>
      <path pathLength="1" d="M50 24 A20 20 0 0 0 14 22" />
      <path pathLength="1" d="M14 40 A20 20 0 0 0 50 42" />
      <path pathLength="1" d="M10 14 L14 22 L22 18 M54 50 L50 42 L42 46" />
    </>
  ),
  review: (
    <>
      <path pathLength="1" d="M8 12 H56 V42 H28 L16 54 V42 H8 Z" />
      <path pathLength="1" d="M32 18 V30 M32 35 V37" />
    </>
  ),
  security: (
    <>
      <path
        pathLength="1"
        d="M32 6 L54 14 V30 C54 44, 44 52, 32 58 C20 52, 10 44, 10 30 V14 Z"
      />
      <circle pathLength="1" cx="32" cy="28" r="5" />
      <path pathLength="1" d="M32 33 V42" />
    </>
  ),
};

/** Principle ids that share a glyph with an existing one. */
const GLYPH_ALIAS: Record<string, string> = {
  "final-state": "verify",
  "tests-fail": "tests",
  disprove: "review",
  humble: "security",
  admit: "reuse",
  spec: "contracts",
};
const GLYPH_ORDER = Object.keys(GLYPHS);

function glyphFor(id: string, index: number): React.ReactNode {
  return (
    GLYPHS[id] ??
    GLYPHS[GLYPH_ALIAS[id] ?? ""] ??
    GLYPHS[GLYPH_ORDER[index % GLYPH_ORDER.length]]
  );
}

/**
 * The principles as cards: a single column on phones, a grid from md up.
 */
export function Principles({ principles, copy }: PrinciplesProps) {
  const meta = sectionMeta("principles");
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
        {/* One column on phones (a sideways scroller hid seven of the
            eight), two from md, three from lg. */}
        <ul className="grid gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {principles.map((p, i) => (
            <li
              key={p.id}
              // Column index in the md (2-up) and lg (3-up) grids, so cards in
              // one row draw a beat apart.
              style={{ "--c2": i % 2, "--c3": i % 3 } as React.CSSProperties}
              className="glyph-card group relative grid grid-cols-[2.75rem_1fr] gap-x-4 overflow-hidden rounded-sm border border-graticule bg-paper-raised p-5 md:flex md:flex-col md:justify-between md:gap-10 md:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `var(${meta.colorVar})` }}
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 64 64"
                className="glyph mt-1 size-11 text-ink md:mt-0 md:size-20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {glyphFor(p.id, i)}
              </svg>
              <div>
                <h3 className="text-xl leading-tight font-extrabold text-balance font-expanded md:text-[1.75rem]">
                  {p.title}
                </h3>
                <p className="mt-2 text-ink-soft md:mt-3">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

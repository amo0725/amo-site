# Amo Feng — personal site

[![CI](https://github.com/amo0725/amo-site/actions/workflows/ci.yml/badge.svg)](https://github.com/amo0725/amo-site/actions/workflows/ci.yml)

Live: **https://amo-site.vercel.app** ([中文](https://amo-site.vercel.app/zh-TW) · [English](https://amo-site.vercel.app/en))

Next.js 16 (App Router, Cache Components, React Compiler) · React 19 · Tailwind CSS 4 · three.js · Motion · Lenis.
Bilingual: Traditional Chinese at `/zh-TW`, English at `/en`.

The visual idea is a weather-radar echo map: chart-paper background, map ink, and the radar
reflectivity scale as the palette. The hero is a live 3D echo field; each section owns one band
of the scale, which the header, the side legend and the section swatches reuse. The page leads
with the case log (the three cases to read first start open); a 30-second showreel, generated in
code, sits with the side projects.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  → redirects to /zh-TW or /en
npm run build && npm start
```

`NEXT_PUBLIC_SITE_URL` sets the production URL (canonical, hreflang, OG, sitemap, JSON-LD);
it defaults to https://amo-site.vercel.app.

## Checks

```bash
npm run lint
npm run typecheck
npm run build && npm start -- -p 3100 &   # then:
npm run smoke                              # BASE_URL, CHROME_PATH
```

`scripts/smoke.mjs` loads both languages at desktop and phone widths against the production
build and fails on what a first visit depends on: the page and h1, the call to action into the
case log, the featured cases being open, every public project linking to its repository, the
phone section menu, console errors, a placeholder domain in canonical/sitemap/robots, and the
Open Graph images. GitHub Actions runs lint, typecheck, build and the smoke test on every push
and pull request (`.github/workflows/ci.yml`).

## Exporting the showreel

The reel is a pure function of time, so it can be rendered frame by frame:

```bash
npm run build && npm start      # terminal 1
npm run export:reel             # terminal 2 (needs ffmpeg and Chrome)
```

This writes `public/reel/amo-feng-showreel-<lang>.mp4` (1920 × 1080, 60 fps) and a
poster JPG per language. The site links them from the reel's "how it's made" panel and
falls back to them without JavaScript. Re-run it after changing `features/reel/scenes.tsx`
or the reel copy. Options: `REEL_URL`, `REEL_LANGS`, `REEL_FPS`, `CHROME_PATH`.

## Editing content

All copy lives in `src/content/` and is typed by `src/content/types.ts`. Both languages must
satisfy the same `SiteContent` type, so a missing translation is a type error.

| File | What it holds |
| --- | --- |
| `zh-TW.ts`, `en.ts` | profile, experience (by domain, no employer names or dates), systems map, work log, principles, AI workflow, projects, off duty, showreel copy, interface strings |
| `shared.ts` | email and profile links (same in both languages) |
| `src/config/site.ts` | section order and band colours, category colours |
| `src/config/graph-layouts.ts` | node positions for the systems map (wide and narrow) |

Strings with `{name}` placeholders are filled by `fill()` in `src/lib/i18n.ts`.

## What moves, and how

Rules the motion follows: every movement starts from something already on screen, no
crossfades, glows, particle bursts, screen shake or bouncy easing, and no decorative readouts.

| Piece | Technique |
| --- | --- |
| Hero radar | three.js, one instanced draw call; height, colour, sweep, pointer storm trail, click pings and scroll dive all computed in the vertex shader |
| Hero name | variable-font width and weight respond to the pointer; letters lift away on scroll |
| Cursor | radar range ring; locks onto links and buttons as a target box |
| Showreel | 32-second loop (the last frame equals the first); one green signal that is never cut: it becomes the packet, the inbox, the heartbeat's pen, the choke point and the colour bar. Custom keyframe engine (`features/reel/engine.ts`), every property a pure function of time on a 120 BPM grid; size, radius and colour morph; closed-form springs with a few percent of overshoot at most |
| Statement | words ink in on scroll (CSS scroll-driven animation) |
| Section titles | a rule in the section's band sweeps in along the top border, then the swatch and title wipe in (CSS) |
| Experience | index numbers ink in as they pass (CSS) |
| Systems map | edges draw in, packets flow; nodes are real buttons and can be dragged with a mouse |
| Projects | each mini radar makes one turn as its row crosses the screen (CSS view timeline) |
| AI workflow | a signal fills the pipeline and lights each station (CSS) |
| Sim racing | hold to rev: needle and rev limiter; the title widens and gets heavier with the revs |
| Contact | ink panel opens like a radar ring from the bottom edge (CSS) |

### Motion preference

`data-motion="full" | "reduced"` on `<html>` is set by an inline script before first paint, from
the system setting (reduced motion or Data Saver). The switch in the hero lets a visitor
override it either way, and the choice is remembered. CSS, Motion, Lenis, the cursor, the radar
and the showreel all read this one attribute. With motion off, every state change still works;
only the movement is dropped, and the radar renders one still frame.

## Performance decisions

- **Static by contract.** `ensureStatic = "navigation"` on the root layout fails the build if
  anything adds request-time rendering. `/` is the only dynamic piece: `src/proxy.ts` redirects
  it by `Accept-Language`.
- **3D off the critical path.** three.js loads after `requestIdleCallback`. The hero name is
  server-rendered text and the LCP element; its intro keeps it visible from the first frame, and
  size containment keeps its width animation from re-laying out the page.
- **Device tiers** (`lib/device/render-tier.ts` → `features/radar/quality.ts`): grid density and
  pixel-ratio cap per tier. Software rasterisers get the SVG poster instead of WebGL.
- **Frame budget.** `FrameBudget` watches real frame times; the scene drops a tier when it keeps
  missing ~48 fps, and freezes on a still frame below the lowest tier.
- **Only renders when seen.** The radar and the showreel pause off-screen and in hidden tabs;
  the showreel's stage code loads only when it gets near the viewport.
- **Off-screen sections are skipped.** `content-visibility: auto` on every section below the
  hero, so their style, layout and running CSS animations cost nothing until they are near.
- **Hydration in pieces.** Each section is its own `<Suspense>` boundary, so React hydrates
  below-the-fold islands in separate, interruptible tasks.
- **No JS where CSS will do.** Scroll choreography uses CSS scroll-driven animations; the
  work-log disclosure is native `<details>`; the clocks are corrected before paint.
- **Fonts.** Archivo variable, subset to the Latin glyphs used, weight 400–900, width 62–125%
  (45 KB). Chinese uses the system CJK font. Rebuild with `scripts/subset-font.sh`.

Measured on a production build with Lighthouse 12: desktop 100 / 100 / 100 / 100;
mobile (simulated 4× CPU slowdown) performance in the high 80s, the rest 100.

## SOLID, concretely

- **Single responsibility** — content, configuration, sections and features are separate modules.
  `RadarRenderer` draws, `FrameBudget` measures, `detectRenderTier` decides, `HeroVisual` owns the
  lifecycle; `Timeline` plays keyframes, `scenes.tsx` choreographs, `ReelPlayer` is the chrome.
- **Open/closed** — quality tiers, categories, section bands, graph layouts and showreel scenes
  are data. Adding a tier, a section band, a language or a scene needs no renderer changes.
- **Liskov** — `HeroVisual` depends on the `HeroRenderer` interface; the player depends on
  `ReelControls`. Any implementation that honours them can stand in.
- **Interface segregation** — components take narrow props (`IntegrationMap` gets nodes, edges,
  two layouts and its own strings), never the whole content object.
- **Dependency inversion** — `app/[lang]/page.tsx` is the composition root and the only place
  that picks content; sections depend on the types in `content/types.ts`.

## Accessibility

Skip link, real buttons for every interactive node, `aria-pressed` and `role="switch"` where
they apply, live regions for the graph details and copy confirmation, a text summary of the
showreel, visible focus rings, `hreflang` alternates, and contrast that passes in both themes.

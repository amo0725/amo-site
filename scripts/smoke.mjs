#!/usr/bin/env node
/**
 * Smoke test against a running production build (`next start`).
 *
 * Checks what a recruiter's first visit depends on, in both languages and
 * at desktop and phone widths: the page answers, the first screen names
 * the person and the role, the call to action points at the case log, the
 * featured cases are open (none on phones), the hero carries its three
 * proof figures, nothing scrolls sideways, every public project links to its repository,
 * the phone menu opens, the visual summaries are there (evidence cards,
 * flow drawings, screenshots) and a flow badge lands on its area open, the
 * case and experience pages answer and lead back, and nothing logs an
 * error. Also checks the
 * sitemap, robots and the Open Graph image, and that no URL still points
 * at a placeholder domain.
 *
 *   BASE_URL     server to test         (default: http://localhost:3100)
 *   CHROME_PATH  browser executable     (default: installed Google Chrome)
 *
 * Usage: npm run build && (npm start -- -p 3100 &) && npm run smoke
 */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? "ok  " : "FAIL"} ${message}`);
};

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not answer`);
}

await waitForServer(`${BASE}/en`);

for (const path of ["/sitemap.xml", "/robots.txt"]) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.text();
  check(res.ok, `${path} answers ${res.status}`);
  check(!body.includes("example.com"), `${path} has no placeholder domain`);
  if (path === "/sitemap.xml") {
    check(
      body.includes("/work/vanishing-index") && body.includes("/experience/messaging"),
      `${path} lists the case and experience pages`,
    );
  }
}

const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" },
);

const viewports = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, mobile: false },
  { name: "phone", viewport: { width: 390, height: 844 }, mobile: true },
];

for (const lang of ["zh-TW", "en"]) {
  for (const vp of viewports) {
    const label = `${lang} ${vp.name}`;
    const context = await browser.newContext({
      viewport: vp.viewport,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    const res = await page.goto(`${BASE}/${lang}`, { waitUntil: "networkidle" });
    check(res?.ok(), `${label}: page answers ${res?.status()}`);

    const h1 = await page.locator("h1").innerText();
    check(/Amo/.test(h1), `${label}: h1 names Amo`);
    const a11y = await page.locator("h1 .sr-only").innerText();
    check(a11y.includes("Amo Feng"), `${label}: h1 carries the full name`);

    const cta = page.locator('main a[href="#work"]').first();
    check(await cta.isVisible(), `${label}: case-log call to action is visible`);

    // Phones get the log as an outline: every case starts closed (see WorkLog).
    const want = vp.mobile ? 0 : 3;
    const open = await page.locator("#work details.log-entry[open]").count();
    check(open === want, `${label}: ${open} featured cases open (want ${want})`);

    const proof = await page.locator("#hero-title ~ dl > div").count();
    check(proof === 3, `${label}: ${proof} proof figures under the headline`);

    // Phones fold the detail of the experience, principles and projects.
    if (vp.mobile) {
      const folds = await page.$$eval("details.phone-fold", (ds) => [
        ds.length,
        ds.filter((d) => d.open).length,
      ]);
      check(folds[0] > 0 && folds[1] === 0, `${label}: ${folds[0]} phone folds, ${folds[1]} open (want 0)`);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(overflow <= 0, `${label}: no horizontal scroll (${overflow}px over)`);

    const repos = await page.$$eval("#projects h3 a", (as) =>
      as.map((a) => a.getAttribute("href")),
    );
    check(
      repos.length > 0 && repos.every((h) => h?.startsWith("https://github.com/")),
      `${label}: ${repos.length} project repo link(s)`,
    );

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    check(
      !!canonical && !canonical.includes("example.com"),
      `${label}: canonical is ${canonical}`,
    );

    if (vp.mobile) {
      const button = page.locator('button[aria-controls="section-menu"]');
      await button.click();
      const visible = await page.locator("#section-menu").isVisible();
      check(visible, `${label}: section menu opens`);
      await page.locator('#section-menu a[href="#contact"]').click();
      await page.waitForTimeout(600);
      check(
        !(await page.locator("#section-menu").isVisible()),
        `${label}: section menu closes after a link`,
      );
    }

    // The visual first layer: evidence cards, a flow drawing per main
    // track, a screenshot per project, and the way to each full write-up.
    const cards = await page.locator("#signal a.vs-row").count();
    check(cards === 4, `${label}: ${cards} looks-fine / actually cards`);
    const flows = await page.locator("#experience .track-flow").count();
    check(flows === 2, `${label}: ${flows} experience flow drawings`);
    const shots = await page.locator("#projects figure img").count();
    check(shots >= 4, `${label}: ${shots} project screenshots`);
    const caseLinks = await page.locator('#work a[href*="/work/"]').count();
    check(caseLinks > 0, `${label}: ${caseLinks} links to full case pages`);

    // A badge on a flow drawing opens its area and lands on it.
    const badge = page.locator("#experience a.area-badge").first();
    const target = (await badge.getAttribute("href"))?.slice(1) ?? "";
    await badge.click();
    await page.waitForTimeout(1200);
    const landed = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const top = el?.getBoundingClientRect().top ?? -1;
      return [!!el?.querySelector("details[open]"), top >= 0 && top < 200];
    }, target);
    check(landed[0] && landed[1], `${label}: area badge opens and lands on #${target}`);

    // One case page and one experience page: they answer, carry an h1,
    // lead back to the item they expand, and don't scroll sideways.
    for (const path of [`/${lang}/work/vanishing-index`, `/${lang}/experience/messaging`]) {
      const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      check(r?.ok(), `${label}: ${path} answers ${r?.status()}`);
      check((await page.locator("h1").count()) === 1, `${label}: ${path} has one h1`);
      const back = await page.locator("header a").first().getAttribute("href");
      check(!!back && back.startsWith(`/${lang}#`), `${label}: ${path} leads back to ${back}`);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      check(over <= 0, `${label}: ${path} no horizontal scroll (${over}px over)`);
    }

    check(errors.length === 0, `${label}: no console errors ${errors.join(" | ")}`);
    await context.close();
  }

  const og = await fetch(`${BASE}/${lang}/opengraph-image/card`);
  check(
    og.ok && (og.headers.get("content-type") ?? "").startsWith("image/png"),
    `${lang}: Open Graph image answers ${og.status}`,
  );
}

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed");

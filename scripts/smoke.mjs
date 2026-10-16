#!/usr/bin/env node
/**
 * Smoke test against a running production build (`next start`).
 *
 * Checks what a recruiter's first visit depends on, in both languages and
 * at desktop and phone widths: the page answers, the first screen names
 * the person and the role, the call to action points at the case log, the
 * featured cases are open (one on phones), the hero carries its three
 * proof figures, nothing scrolls sideways, every public project links to its repository,
 * the phone menu opens, and nothing logs an error. Also checks the
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

    // Phones keep only the first featured case open (see WorkLog).
    const want = vp.mobile ? 1 : 3;
    const open = await page.locator("#work details[open]").count();
    check(open === want, `${label}: ${open} featured cases open (want ${want})`);

    const proof = await page.locator("#hero-title ~ dl > div").count();
    check(proof === 3, `${label}: ${proof} proof figures under the headline`);

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

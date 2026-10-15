#!/usr/bin/env node
/**
 * Export the showreel to MP4, one file per language.
 *
 * The reel is a pure function of time, so a headless browser can seek to
 * every frame, screenshot it, and pipe the PNGs straight into ffmpeg.
 *
 * Usage (needs ffmpeg on PATH and a Chrome/Chromium):
 *   npm run build && npm start            # in one terminal
 *   npm run export:reel                   # in another
 *
 * Options (env):
 *   REEL_URL     site origin            (default http://localhost:3000)
 *   REEL_LANGS   comma-separated        (default zh-TW,en)
 *   REEL_FPS     frames per second      (default 60)
 *   CHROME_PATH  browser executable     (default: installed Google Chrome)
 *
 * Output: public/reel/amo-feng-showreel-<lang>.mp4 and a .jpg poster.
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, "public", "reel");
const URL_BASE = process.env.REEL_URL ?? "http://localhost:3000";
const LANGS = (process.env.REEL_LANGS ?? "zh-TW,en").split(",");
const FPS = Number(process.env.REEL_FPS ?? 60);
const WIDTH = 1920;
const HEIGHT = 1080;
/** Where the poster is taken: the finished name card, before it folds away. */
const POSTER_AT = 29.6;

// Show only the reel frame, full viewport, with no transitions in the chrome.
const ISOLATE_CSS = `
  html, body { overflow: hidden !important; background: #0a131a !important; }
  /* Sections use content-visibility/containment, which would make the
     "fixed" frame position and clip against its section, not the viewport. */
  main, section { content-visibility: visible !important; contain: none !important;
    transform: none !important; filter: none !important; }
  /* Hide everything but the frame. Its children inherit visibility, so the
     engine's own inline visibility (used to hide zero-length strokes) still wins. */
  body *:not(.reel-frame, .reel-frame *) { visibility: hidden !important; }
  .reel-frame { visibility: visible !important; }
  .reel-frame * { transition: none !important; }
  .reel-frame { position: fixed !important; inset: 0 !important; width: 100vw !important;
    height: 100vh !important; aspect-ratio: auto !important; border-radius: 0 !important;
    z-index: 2147483647 !important; }
  .reel-frame > :not(.reel-stage) { display: none !important; }
`;

function encoder(file) {
  const ff = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel", "error",
      "-f", "image2pipe",
      "-framerate", String(FPS),
      "-i", "-",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      file,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((resolve, reject) => {
    ff.on("error", reject);
    ff.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)),
    );
  });
  const write = (buf) =>
    new Promise((resolve) => {
      if (ff.stdin.write(buf)) resolve();
      else ff.stdin.once("drain", resolve);
    });
  return { write, end: () => (ff.stdin.end(), done) };
}

async function exportLang(browser, lang) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    // Reduced motion keeps the player from autoplaying; seeking still works.
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${URL_BASE}/${lang}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.getElementById("reel")?.scrollIntoView());
  await page.waitForSelector('.reel-stage[data-ready="1"]', { timeout: 30_000 });
  await page.waitForFunction(() => {
    const s = document.querySelector(".reel-scrub");
    return s instanceof HTMLInputElement && !s.disabled;
  });
  await page.evaluate(() => document.fonts.ready);

  const duration = await page.evaluate(() =>
    Number(document.querySelector(".reel-scrub")?.getAttribute("max")),
  );
  const seek = (t) =>
    page.evaluate((time) => {
      const s = document.querySelector(".reel-scrub");
      s.value = String(time);
      s.dispatchEvent(new Event("input", { bubbles: true }));
      return new Promise((r) => requestAnimationFrame(() => r()));
    }, t);

  await seek(0.001);
  await page.addStyleTag({ content: ISOLATE_CSS });
  await page.waitForTimeout(300);

  const base = path.join(OUT_DIR, `amo-feng-showreel-${lang}`);
  await seek(POSTER_AT);
  await page.screenshot({ path: `${base}.jpg`, type: "jpeg", quality: 88 });

  const frames = Math.round(duration * FPS);
  const ff = encoder(`${base}.mp4`);
  const started = Date.now();
  for (let i = 0; i < frames; i += 1) {
    await seek(i / FPS);
    await ff.write(await page.screenshot({ type: "png" }));
    if (i % FPS === 0) {
      const sec = ((Date.now() - started) / 1000).toFixed(0);
      process.stdout.write(`\r${lang}: ${i}/${frames} frames (${sec}s)`);
    }
  }
  await ff.end();
  process.stdout.write(`\r${lang}: ${frames}/${frames} frames, wrote ${base}.mp4\n`);
  await context.close();
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" },
);
try {
  for (const lang of LANGS) await exportLang(browser, lang);
} finally {
  await browser.close();
}

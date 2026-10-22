#!/usr/bin/env node
/**
 * Builds the small Traditional Chinese face the case share cards use
 * (src/assets/fonts/og-cjk-700.woff) and the list of characters it covers
 * (og-cjk-chars.json). The card generator falls back to the English title
 * for any zh title with a character outside that list, so a new case still
 * gets a card; run this again after changing zh case titles to give it the
 * Chinese one.
 *
 *   NOTO_DIR  folder with @fontsource/noto-sans-tc's files/*.woff
 *             (npm pack @fontsource/noto-sans-tc, then unpack)
 *
 * Needs Node 22 (type stripping) and Python 3 with fontTools.
 *
 * Usage: NOTO_DIR=/path/to/package/files node --experimental-strip-types scripts/og-font.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { register } from "node:module";
import { join } from "node:path";

// The content imports its siblings without an extension, as the bundler
// allows; resolve those to .ts here.
register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try { return await next(specifier, context); }
  catch (error) {
    if (specifier.startsWith(".")) return next(specifier + ".ts", context);
    throw error;
  }
}`),
);

const { zhTW } = await import("../src/content/zh-TW.ts");
const { cardText } = await import("../src/lib/og-card-text.ts");

const text = zhTW.work.entries.flatMap((entry) => cardText(zhTW, entry)).join("");
const chars = [...new Set([...text].filter((c) => c.codePointAt(0) > 0x2000))]
  .sort()
  .join("");

const root = new URL("..", import.meta.url).pathname;
const fonts = join(root, "src/assets/fonts");
writeFileSync(join(fonts, "og-cjk-chars.json"), JSON.stringify(chars) + "\n");

const dir = process.env.NOTO_DIR;
if (!dir) throw new Error("Set NOTO_DIR to @fontsource/noto-sans-tc's files folder");

execFileSync(
  "python3",
  [
    "-c",
    `
import glob, sys, os
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
chars = set(sys.argv[1])
parts = []
for path in sorted(glob.glob(os.path.join(sys.argv[2], "noto-sans-tc-*-700-normal.woff"))):
    font = TTFont(path)
    have = set(chr(c) for c in font.getBestCmap()) & chars
    if not have:
        continue
    options = subset.Options()
    options.flavor = None
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    sub = subset.Subsetter(options)
    sub.populate(text="".join(sorted(have)))
    sub.subset(font)
    out = path.rsplit("/", 1)[1] + ".ttf"
    out = os.path.join("/tmp", out)
    font.save(out)
    parts.append(out)
    chars -= have
merged = Merger().merge(parts)
merged.flavor = "woff"
merged.save(sys.argv[3])
print("missing:", "".join(sorted(chars)) or "none", file=sys.stderr)
`,
    chars,
    dir,
    join(fonts, "og-cjk-700.woff"),
  ],
  { stdio: "inherit" },
);
console.log(`${chars.length} characters → src/assets/fonts/og-cjk-700.woff`);

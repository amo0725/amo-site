#!/usr/bin/env bash
# Rebuilds src/assets/fonts/archivo-variable.woff2 from the full Archivo
# variable font: Latin glyphs used on the site only, weight 400–900,
# width 62–125%. Chinese text uses the system CJK font, so it is not included.
#
# Requires: pip install fonttools brotli
set -euo pipefail

SRC="node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"
OUT="src/assets/fonts/archivo-variable.woff2"
TMP="$(mktemp -d)"

pyftsubset "$SRC" \
  --unicodes="U+0020-007E,U+00A0,U+00A9,U+00B0,U+00B7,U+00D7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192,U+2197,U+2212" \
  --layout-features="kern,liga,tnum,lnum,case" \
  --flavor=woff2 \
  --output-file="$TMP/subset.woff2"

fonttools varLib.instancer "$TMP/subset.woff2" wght=400:900 wdth=62:125 -o "$OUT"
ls -la "$OUT"

#!/usr/bin/env bash
# Rebuild vendor/esm/ — the analytics page's React / react-dom / recharts / d3.
# One esbuild run with --splitting: every importmap entry imports the SAME React
# chunk, so there is exactly one React instance on the page (ADR-018).
# Versions are pinned to what esm.sh's react@18 / recharts@2 / d3@7 resolved to
# on 2026-11-24. Change them here, rebuild, re-test every analytics tab, bump the SW.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
cd "$WORK"
echo '{"private":true}' > package.json
npm install --ignore-scripts --no-audit --no-fund \
  react@18.3.1 react-dom@18.3.1 recharts@2.15.4 d3@7.9.2 esbuild@0.24.2
node node_modules/esbuild/install.js
NODE_ENV=production node "$REPO/tools/vendor/gen_entries.mjs" "$WORK"
npx esbuild entries/react.js entries/react-dom.js entries/react-dom-client.js \
  entries/react-jsx-runtime.js entries/recharts.js entries/d3.js \
  --bundle --splitting --format=esm --minify --target=es2020 \
  --define:process.env.NODE_ENV='"production"' \
  --outdir=out --chunk-names='chunk-[hash]' --legal-comments=eof
rm -rf "$REPO/vendor/esm" && mkdir -p "$REPO/vendor/esm" && cp out/*.js "$REPO/vendor/esm/"
echo "vendor/esm rebuilt from $WORK — chunk hashes may change: precache list is unaffected (on-demand)."

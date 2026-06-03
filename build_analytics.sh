#!/usr/bin/env bash
# build_analytics.sh
# Compile React JSX components to ES module bundles for analytics.html
# Run from the repo root in WSL. Re-run whenever a JSX component changes.
# Requires: Node.js + npm (no global installs needed — uses npx).

set -e

echo "AGW Analytics — building component bundles..."
echo ""

mkdir -p dist

# Shared externals — resolved by the importmap in analytics.html
EXT="--external:react --external:react-dom --external:react/jsx-runtime"
EXT="$EXT --external:recharts --external:d3"

build_one() {
  local src=$1 out=$2 label=$3
  echo -n "  $label... "
  npx --yes esbuild "$src" $EXT \
    --bundle --format=esm --jsx=automatic \
    --outfile="$out" --log-level=error
  echo "$(( $(wc -c < "$out") / 1024 ))KB"
}

build_one agw_gaze_map.jsx       dist/agw_gaze_map.js  "Gaze Map"
build_one agw_analysis_views.jsx dist/agw_analysis.js  "Analysis A–E"
build_one agw_pmi_viz.jsx        dist/agw_pmi.js        "PMI A–F"

echo ""
echo "Done. Commit and deploy:"
echo "  git add dist/ analytics.html agw_chronik.js"
echo "  git commit -m 'Add analytics page'"
echo "  git push"
ls -lh dist/

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TRACKED_PATHS=(
  "node_modules"
  "node_modules/.vite"
  "src-tauri/target"
  "dist"
  "coverage"
  ".tmp"
  ".lean-cache"
)

echo "Disk usage report for common heavy paths:"
for path in "${TRACKED_PATHS[@]}"; do
  if [ -e "$path" ]; then
    du -sh "$path"
  else
    echo "0B  $path (missing)"
  fi
done

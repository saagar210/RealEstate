#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HEAVY_PATHS=(
  "dist"
  "coverage"
  "src-tauri/target"
  "node_modules/.vite"
  ".tmp"
  ".lean-cache"
)

echo "Removing heavy build artifacts..."
for path in "${HEAVY_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    echo "  removed $path"
  else
    echo "  skipped $path (missing)"
  fi
done

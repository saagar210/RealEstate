#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

"$ROOT_DIR/scripts/clean-heavy.sh"

FULL_PATHS=(
  "node_modules"
)

echo "Removing full reproducible local caches..."
for path in "${FULL_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path" || true
    if [ -e "$path" ]; then
      chmod -R u+w "$path" 2>/dev/null || true
      find "$path" -mindepth 1 -exec rm -rf {} + 2>/dev/null || true
      rmdir "$path" 2>/dev/null || true
    fi
    if [ -e "$path" ]; then
      echo "  failed to fully remove $path"
      exit 1
    fi
    echo "  removed $path"
  else
    echo "  skipped $path (missing)"
  fi
done

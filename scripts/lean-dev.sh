#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEAN_PORT="${LEAN_DEV_PORT:-1420}"
LEAN_VITE_CACHE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/realestate-lean-vite.XXXXXX")"
LEAN_CARGO_TARGET_DIR="$(mktemp -d "${TMPDIR:-/tmp}/realestate-lean-target.XXXXXX")"
TAURI_OVERRIDE_CONFIG="$(mktemp "${TMPDIR:-/tmp}/realestate-tauri-config.XXXXXX.json")"

cleanup() {
  rm -rf "$LEAN_VITE_CACHE_DIR" "$LEAN_CARGO_TARGET_DIR" "$TAURI_OVERRIDE_CONFIG"
}

trap cleanup EXIT INT TERM

cat > "$TAURI_OVERRIDE_CONFIG" <<EOF
{
  "build": {
    "beforeDevCommand": "VITE_DEV_PORT=$LEAN_PORT pnpm dev",
    "devUrl": "http://localhost:$LEAN_PORT"
  }
}
EOF

echo "lean-dev: using temporary Vite cache at $LEAN_VITE_CACHE_DIR"
echo "lean-dev: using temporary Cargo target at $LEAN_CARGO_TARGET_DIR"
echo "lean-dev: starting app on port $LEAN_PORT"

cd "$ROOT_DIR"
VITE_CACHE_DIR="$LEAN_VITE_CACHE_DIR" \
CARGO_TARGET_DIR="$LEAN_CARGO_TARGET_DIR" \
pnpm tauri dev -c "$TAURI_OVERRIDE_CONFIG" "$@"

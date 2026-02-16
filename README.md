# RealEstate

RealEstate Listing Optimizer is a Tauri desktop app for drafting and organizing real-estate listing copy and related marketing materials.

## What It Does

- Create and manage properties
- Generate listing descriptions with style/tone/length presets
- Generate social media posts and email campaigns
- Learn a reusable "brand voice" from past listings
- Store data locally (SQLite)

AI generation uses Anthropic and requires an API key configured in **Settings** (keys start with `sk-ant-`).

## Tech Stack

- Tauri 2 (Rust)
- React + TypeScript + Vite
- Tailwind CSS
- Vitest

## Development

Prerequisites:

- Node.js + `pnpm`
- Rust toolchain
- Tauri system dependencies (see Tauri prerequisites: https://tauri.app/start/prerequisites/)

Install dependencies:

```sh
pnpm install
```

Run the web dev server (Vite):

```sh
pnpm dev
```

Run the desktop app (Tauri + Vite):

```sh
pnpm tauri dev
```

Run the desktop app in lean mode (temporary build caches, auto-clean on exit):

```sh
pnpm dev:lean
```

Optional: change the lean dev port if `1420` is busy:

```sh
LEAN_DEV_PORT=1422 pnpm dev:lean
```

Run tests:

```sh
pnpm test
```

Build:

```sh
pnpm build
pnpm tauri build
```

Cleanup commands:

```sh
# remove heavy build artifacts only (keeps dependencies for speed)
pnpm clean:heavy

# remove all reproducible local caches (including node_modules)
pnpm clean:full
```

Check current heavy-directory sizes:

```sh
pnpm size:report
```

### Normal vs Lean Dev

- Normal dev (`pnpm tauri dev`): fastest incremental rebuilds, but writes caches/artifacts into the repo (`src-tauri/target`, `node_modules/.vite`).
- Lean dev (`pnpm dev:lean`): redirects Rust and Vite build caches to temporary directories and removes them automatically when the process exits.
- Tradeoff: lean mode uses less persistent disk in the project but usually has slower startup and less incremental compile reuse between runs.

## Project Layout

- `src/`: frontend UI
- `src-tauri/`: Tauri backend (Rust) and local migrations

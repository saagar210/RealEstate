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

Run tests:

```sh
pnpm test
```

Build:

```sh
pnpm build
pnpm tauri build
```

## Project Layout

- `src/`: frontend UI
- `src-tauri/`: Tauri backend (Rust) and local migrations

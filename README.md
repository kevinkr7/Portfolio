# Kevin — Creative Technologist Portfolio

An immersive, high-performance portfolio showcasing interactive 3D worlds, procedural gemstones, shaders, and creative engineering. Built with WebGPU, WebGL/Three.js, TSL shaders, React, and a dedicated responsive Lite version.

## Features

- **WebGPU Experience**: Real-time 3D procedural gemstones, custom shaders, dynamic caustics, and interactive audio transitions.
- **Project Case Studies**: 10 interactive project showcases (NoctaLink, NexaSense, CrossWise, Cadenza, Harmonza, Percepta, Canteen Cuisine Commander, Spotifix, Evalion, Cesium).
- **Poetic Subtitles & Voiceover**: Story-driven transition between Projects and About with automated sequential voice narration queue.
- **Mobile-Optimized Lite Mode**: Lightweight, high-speed fallback designed specifically for mobile and lower-power devices.
- **SEO & Social Metadata**: Pre-rendered semantic markup, OpenGraph tags, and structured schemas.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start local preview server (http://127.0.0.1:4173)
npm run dev
```

### Verification & Integrity

```bash
# Run verification checks across all 10 project routes, runtime files, and content manifests
npm run verify
```

## Cloudflare Deployment

This repository supports both **Cloudflare Workers (with Static Assets)** and **Cloudflare Pages**:

### Option A: Cloudflare Workers (Wrangler Deploy)
If your Cloudflare project runs `npx wrangler deploy`:
- The repository includes [wrangler.toml](file:///c:/Users/kevin/.codex/visualizations/2026/10/21/01a15de3-cccb-7130-8bef-34e1b8b8bbfc/wrangler.toml) and [wrangler.jsonc](file:///c:/Users/kevin/.codex/visualizations/2026/10/21/01a15de3-cccb-7130-8bef-34e1b8b8bbfc/wrangler.jsonc) pre-configured with:
  ```toml
  name = "kevinography"
  compatibility_date = "2026-10-30"

  [assets]
  directory = "./dist"
  not_found_handling = "single-page-application"
  ```
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`

### Option B: Cloudflare Pages (Direct Static Hosting)
If your Cloudflare project is set up under **Pages**:
- **Framework preset**: `None`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Deploy command**: *(leave empty)*

All static routes, 3D WebGPU scenes, audio tracks (`dist/voice/*.mp3`), and SPA client routing via `dist/404.html` are served globally on Cloudflare's edge network.

## Project Structure

- `dist/` — Production build assets, pre-rendered HTML routes, shaders, and static media
- `dist/voice/` — Narration voiceover audio tracks (`1.mp3` – `5.mp3`)
- `src/content/projects.json` — Structured case study metadata and project specifications
- `src/runtime-lock.json` — Cryptographic SHA-256 runtime integrity manifest
- `scripts/` — Deterministic build, verification, and runtime locking tools

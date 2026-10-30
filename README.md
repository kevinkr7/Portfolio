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

## Cloudflare Pages Deployment

This repository is ready for immediate deployment on **Cloudflare Pages**:

1. Connect your GitHub repository to **Cloudflare Pages**.
2. Configure build settings:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Click **Save and Deploy**.

All static routes, assets, audio files, and the client-side SPA fallback (`dist/404.html`) will be served globally on Cloudflare's edge network.

## Project Structure

- `dist/` — Production build assets, pre-rendered HTML routes, shaders, and static media
- `dist/voice/` — Narration voiceover audio tracks (`1.mp3` – `5.mp3`)
- `src/content/projects.json` — Structured case study metadata and project specifications
- `src/runtime-lock.json` — Cryptographic SHA-256 runtime integrity manifest
- `scripts/` — Deterministic build, verification, and runtime locking tools

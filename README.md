# KiJi Website

Public Cloudflare Pages website for KiJi, a simple private RSS reader that keeps user reading data local and exportable.

## Purpose

This repo owns the public landing page, download page, resource page, changelog, RSS update feed, support/privacy pages, and AI/agent-readable metadata for KiJi.

The canonical product behavior and brand guidance remain in the private KiJi app repo. Keep this repo focused on public presentation, brand copy, logo resources, and download metadata.

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` starts the local debug server at:

```text
http://127.0.0.1:5173/
```

Cloudflare Pages settings:

| Setting | Value |
|---|---|
| Framework preset | React / Vite |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Node version | `20` |

This repo also includes `wrangler.toml` with `pages_build_output_dir = "dist"` for Cloudflare Pages tooling.

## Required online links

- Website: `https://kiji.yomilab.app`
- Downloads: `https://kiji.yomilab.app/download/`
- Updates RSS: `https://kiji.yomilab.app/feed.xml`
- Public release manifest: `https://github.com/yomilab/kiji-releases/releases/latest/download/release.json`
- Resource repo: `https://github.com/yomilab/kiji-resource`

## Download data

The download page reads version and asset information from the generated release manifest:

```text
https://github.com/yomilab/kiji-releases/releases/latest/download/release.json
```

For local development before the release repo is online, the page falls back to:

```text
src/data/latestRelease.json
```

Do not manually maintain download URLs in React components. Generate `release.json` from the KiJi app repo release workflow and publish it with the release assets.

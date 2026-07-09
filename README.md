# KiJi Website

Public Cloudflare Pages website for KiJi — a simple, private reader.

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

Cloudflare Pages settings (local build output):

| Setting | Value |
|---|---|
| Framework preset | React / Vite |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Node version | `20` |

**Production deploy:** push to **`main`** — Cloudflare Pages (Git integration) builds with `npm ci && npm run build` and publishes `dist/`. Each change: commit on `main` + update `kiji-doc` in the same task. See `kiji-doc/docs/website/setup-kiji-website-deploy.md`.

## Required online links

- Website: `https://kiji.yomilab.app`
- Downloads: `https://kiji.yomilab.app/download/`
- Updates RSS: `https://kiji.yomilab.app/feed.xml`
- Public release manifest: `https://kiji.yomilab.app/release.json`
- GitHub Releases (installers): `https://github.com/yomilab/kiji-app/releases/latest`
- Resource repo: `https://github.com/yomilab/kiji-resource`

## Download data

The download page reads version and asset information from the release manifest:

```text
https://kiji.yomilab.app/release.json
```

Installers are hosted on `yomilab/kiji-app` GitHub Releases. For local development when the runtime fetch fails, the page falls back to:

```text
src/data/latestRelease.json
```

Do not manually maintain download URLs in React components. Generate `release.json` from the KiJi app repo release workflow and publish it with the release assets.

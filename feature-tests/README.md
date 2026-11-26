# Feature tests (Framework Compare)

Each spec proves one row of the Framework Compare "performance features" table for Pracht against a
**production build** served by the Node adapter (`PRACHT_NODE=1`). Pages live under `/feature-tests/*`
(`src/routes/feature-tests/`, shell `src/shells/feature-tests.tsx`); the book pages are untouched.

```bash
npm ci --ignore-scripts   # sharp ships prebuilt binaries; its install script is not needed
npm run test:features     # → feature-tests/results.json
```

`feature-tests/run.mjs` (1) runs the build-time specs, which run their own builds, (2) runs
`PRACHT_NODE=1 pracht build`, (3) serves `dist/server/server.js` on `FT_PORT` (default 4113), (4) runs
the runtime specs with the system Chrome (`CHROME_PATH`, default `~/.local/bin/google-chrome`), and
(5) merges the Playwright JSON into `results.json`. Scratch output goes to `feature-tests/out/` (ignored).

| Feature | API used (all 1st-party) | What the spec checks |
| --- | --- | --- |
| css-inlining | `pracht({ inlineCss: true })` | route + shell CSS in `<style data-pracht-inline-css>`, no `<link rel=stylesheet>`, styled with JS off and 0 CSS requests |
| font-optimization | `defineFont()` + `head().fonts` | `<link rel=preload as=font crossorigin>`, `@font-face` with `font-display:swap`, size-adjusted `local()` fallback, same-origin woff2, no Google Fonts |
| image-pipeline | `@pracht/image` `<Image>` + `?pracht` import + `createImageHandler` | srcset ≥2 widths, width/height, `loading=lazy` offscreen, srcset URL returns `image/webp` |
| caching | `render: "isg"`, `timeRevalidate(5)` | same timestamp inside TTL; after TTL one stale response, then a fresh value |
| route-prefetching | `<Link prefetch="intent" / "viewport">` | hover and scroll-into-view each fire a request for the target route before the click |
| islands | `hydration: "islands"` + `src/islands/` | island counter works; no loaded JS contains the static component's marker |
| render-modes | `render: "ssg"` vs `render: "ssr"` | SSG HTML exists in `dist/client` with a stable stamp; SSR stamp changes per request |
| reactivity | `@preact/signals` `useSignal` | text updates while the component render counter stays at 1 |
| bundle-analysis | `pracht build --analyze [--json]` | writes `out/bundle-report.json` with per-route entries (+ text table) |
| third-party-scripts | `<Script strategy="idle">` | not in SSR HTML (not parser-blocking), injected after DOMContentLoaded, sets its global |
| multi-host-deployment | `@pracht/adapter-{vercel,netlify,cloudflare,node}` | each build emits its expected output (`.vercel/output`, `netlify/functions`, `dist/server/worker.js`, `dist/server/server.js`) |

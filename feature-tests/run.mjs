#!/usr/bin/env node
// Builds, serves and tests every Framework Compare feature, then writes feature-tests/results.json.
import { execSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'feature-tests/out');
const PORT = Number(process.env.FT_PORT ?? 4113);
const env = { ...process.env, FT_PORT: String(PORT), POSTGRES_URL: '' };
mkdirSync(OUT, { recursive: true });

const FEATURES = {
  'css-inlining': 'pracht({ inlineCss: true }) in vite.config.ts; route imports css-inlining.css',
  'font-optimization': 'defineFont() from @pracht/core (self-hosted woff2 in public/fonts) registered via head().fonts',
  'image-pipeline': '<Image> from @pracht/image + prachtImage() `?pracht` import; node build uses defaultLoader → sharp endpoint (createImageHandler)',
  caching: 'route render: "isg" with revalidate: timeRevalidate(5); loader returns Date.now()',
  'route-prefetching': '<Link prefetch="intent"> and <Link prefetch="viewport"> from @pracht/core',
  islands: 'route hydration: "islands" + island component in src/islands/ft-counter.tsx',
  'render-modes': 'same module mounted with render: "ssg" and render: "ssr" in src/routes.ts',
  reactivity: '@preact/signals useSignal() bound directly in JSX text',
  'bundle-analysis': 'pracht build --analyze [--json]',
  'third-party-scripts': '<Script strategy="idle" src="/ft/third-party.js"> from @pracht/core',
  'multi-host-deployment': '@pracht/adapter-{vercel,netlify,cloudflare,node} selected by env in vite.config.ts',
};
const BUILD_SPECS = ['bundle-analysis', 'multi-host-deployment'];
const RUNTIME_SPECS = Object.keys(FEATURES).filter(f => !BUILD_SPECS.includes(f));

function playwright(specs, jsonFile) {
  const args = ['playwright', 'test', '-c', 'feature-tests/playwright.config.ts', ...specs.map(s => `feature-tests/${s}.spec.ts`)];
  spawnSync('npx', args, { cwd: ROOT, env: { ...env, FT_JSON: jsonFile }, stdio: 'inherit' });
  return existsSync(jsonFile) ? JSON.parse(readFileSync(jsonFile, 'utf8')) : null;
}

async function waitFor(url, ms = 30_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`server did not start: ${url}`);
}

// 1. Build-time features (they run the builds themselves).
const buildReport = playwright(BUILD_SPECS, join(OUT, 'build.json'));

// 2. Production build for the self-hosted Node adapter, then serve it.
execSync('npx pracht build', { cwd: ROOT, env: { ...env, PRACHT_NODE: '1' }, stdio: 'inherit' });
const server = spawn('node', ['dist/server/server.js'], {
  cwd: ROOT,
  env: { ...env, PORT: String(PORT), PRACHT_ORIGIN: `http://localhost:${PORT}` },
  stdio: 'inherit',
});
let runtimeReport = null;
try {
  await waitFor(`http://localhost:${PORT}/feature-tests`);
  runtimeReport = playwright(RUNTIME_SPECS, join(OUT, 'runtime.json'));
} finally {
  server.kill('SIGTERM');
}

// 3. Merge into results.json.
const tests = new Map();
const walk = suite => {
  for (const spec of suite.specs ?? []) tests.set(spec.file.replace(/^.*\//, '').replace('.spec.ts', ''), spec);
  for (const child of suite.suites ?? []) walk(child);
};
for (const r of [buildReport, runtimeReport]) for (const s of r?.suites ?? []) walk(s);

const results = {};
for (const [feature, method] of Object.entries(FEATURES)) {
  const spec = tests.get(feature);
  const run = spec?.tests?.[0]?.results?.at(-1);
  const evidence = spec?.tests?.[0]?.annotations?.find(a => a.type === 'evidence')?.description
    ?? run?.annotations?.find(a => a.type === 'evidence')?.description;
  const error = run?.error?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').find(Boolean);
  results[feature] = {
    claimedLabel: 'first-party',
    status: !spec ? 'blocked' : run?.status === 'passed' ? 'pass' : 'fail',
    method,
    evidence: run?.status === 'passed' ? evidence : `FAILED: ${error ?? 'spec did not run'}`,
    test: `feature-tests/${feature}.spec.ts`,
  };
}

const commit = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
const output = { framework: 'pracht', repo: 'pracht-books', commit, ranAt: new Date().toISOString(), results };
writeFileSync(join(ROOT, 'feature-tests/results.json'), `${JSON.stringify(output, null, 2)}\n`);
console.table(Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.status])));
process.exit(Object.values(results).every(r => r.status === 'pass') ? 0 : 1);

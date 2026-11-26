import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT, sh } from './helpers';

const p = (...s: string[]) => join(ROOT, ...s);

test('builds for node, vercel, netlify and cloudflare adapters', async () => {
  test.setTimeout(600_000);
  const seen: string[] = [];
  for (const dir of ['.vercel/output', 'netlify/functions']) rmSync(p(dir), { force: true, recursive: true });

  sh('npx pracht build'); // default: vercelAdapter()
  expect(existsSync(p('.vercel/output/config.json'))).toBe(true);
  const funcs = readdirSync(p('.vercel/output/functions')).filter(f => f.endsWith('.func'));
  expect(funcs.length).toBeGreaterThan(0);
  expect(existsSync(p('.vercel/output/static'))).toBe(true);
  seen.push(`vercel: .vercel/output (config.json, static/, ${funcs.length} .func)`);

  sh('npx pracht build', { NETLIFY: '1' });
  expect(existsSync(p('netlify/functions/pracht.mjs'))).toBe(true);
  // Netlify serves ISG pages from the function + durable cache; SSG pages and _headers are static.
  expect(existsSync(p('dist/client/_headers'))).toBe(true);
  expect(existsSync(p('dist/client/feature-tests/css-inlining/index.html'))).toBe(true);
  seen.push('netlify: netlify/functions/pracht.mjs + dist/client (_headers, SSG HTML)');

  sh('npx pracht build', { CLOUDFLARE: '1' });
  expect(existsSync(p('dist/server/worker.js'))).toBe(true);
  seen.push('cloudflare: dist/server/worker.js');

  rmSync(p('dist'), { force: true, recursive: true });
  sh('npx pracht build', { PRACHT_NODE: '1' });
  expect(existsSync(p('dist/server/server.js'))).toBe(true);
  expect(existsSync(p('dist/server/worker.js'))).toBe(false);
  const target = readFileSync(p('dist/server/server.js'), 'utf8').match(/buildTarget\s*=\s*["'](\w+)["']/)?.[1];
  seen.push(`node: dist/server/server.js (buildTarget=${target ?? '?'})`);
  evidence(seen.join('; '));
});

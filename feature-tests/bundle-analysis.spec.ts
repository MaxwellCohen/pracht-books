import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT, sh } from './helpers';

test.describe.configure({ mode: 'serial' });

test('pracht build --analyze --json produces a per-route report', async () => {
  test.setTimeout(300_000);
  const out = sh('npx pracht build --analyze --json', { PRACHT_NODE: '1' });
  const json = out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1);
  const report = JSON.parse(json);
  mkdirSync(join(ROOT, 'feature-tests/out'), { recursive: true });
  const file = join(ROOT, 'feature-tests/out/bundle-report.json');
  writeFileSync(file, JSON.stringify(report, null, 2));
  const text = JSON.stringify(report);
  expect(text).toContain('/feature-tests/islands');
  expect(text).toMatch(/gzip/i);
  const human = sh('npx pracht build --analyze', { PRACHT_NODE: '1' });
  writeFileSync(join(ROOT, 'feature-tests/out/bundle-report.txt'), human);
  expect(human).toMatch(/feature-tests/);
  evidence(
    `--analyze --json wrote feature-tests/out/bundle-report.json (${text.length} bytes, top-level keys: ${Object.keys(report).join(',')}); --analyze table saved to bundle-report.txt`,
  );
});

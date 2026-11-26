import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT } from './helpers';

const MARKER = 'FT_STATIC_ONLY_MARKER';

test('hydration: "islands" hydrates only the island; static component JS not shipped', async ({ page }) => {
  const scripts: { url: string; body: string }[] = [];
  page.on('response', async r => {
    if (r.request().resourceType() === 'script') scripts.push({ body: await r.text().catch(() => ''), url: r.url() });
  });
  await page.goto('/feature-tests/islands');
  await expect(page.getByTestId('static-blurb')).toContainText(MARKER);
  const button = page.getByTestId('island-button');
  await expect(async () => {
    await button.click();
    await expect(page.getByTestId('island-count')).not.toHaveText('0', { timeout: 500 });
  }).toPass();
  await page.waitForLoadState('networkidle');

  const leaking = scripts.filter(s => s.body.includes(MARKER));
  expect(scripts.length).toBeGreaterThan(0);
  expect(leaking.map(s => s.url)).toEqual([]);
  const hasRouterState = await page.evaluate(() => Boolean(document.getElementById('pracht-state')));
  expect(hasRouterState).toBe(false);
  const assets = join(ROOT, 'dist/client/assets');
  const emitted = readdirSync(assets).filter(f => f.endsWith('.js') && readFileSync(join(assets, f), 'utf8').includes(MARKER));
  evidence(
    `island counter increments after hydration; ${scripts.length} JS files loaded (${scripts.map(s => new URL(s.url).pathname.split('/').pop()).join(', ')}), none contain the static marker; no full-page router state (build still emits ${emitted.length} unreferenced chunk(s) with the marker for the SPA route table: ${emitted.join(', ')})`,
  );
});

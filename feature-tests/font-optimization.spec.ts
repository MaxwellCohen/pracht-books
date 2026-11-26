import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('defineFont(): self-hosted, font-display, preload link, fallback metrics', async ({ page }) => {
  const external: string[] = [];
  const fontResponses: { url: string; status: number }[] = [];
  page.on('request', r => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) external.push(r.url());
  });
  page.on('response', r => {
    if (r.request().resourceType() === 'font') fontResponses.push({ status: r.status(), url: r.url() });
  });
  const res = await page.goto('/feature-tests/font-optimization');
  const html = (await res!.text()).split('</head>')[0];

  const preload = html.match(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/)?.[0] ?? '';
  expect(preload).toContain('href="/fonts/geist-mono-latin-wght-normal.woff2"');
  expect(preload).toContain('crossorigin');
  const face = html.match(/@font-face\{font-family:"FT Geist Mono";[^}]*\}/)?.[0] ?? '';
  expect(face).toContain('font-display:swap');
  expect(html).toMatch(/@font-face\{font-family:"FT Geist Mono Fallback[^"]*";src:local\("Courier New"\);[^}]*size-adjust:100%/);

  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('16px "FT Geist Mono"'));
  expect(loaded).toBe(true);
  expect(external).toEqual([]);
  const own = fontResponses.find(r => r.url.endsWith('/fonts/geist-mono-latin-wght-normal.woff2'));
  expect(own?.status).toBe(200);
  evidence(
    `preload <link as=font crossorigin> + @font-face font-display:swap + size-adjusted local() fallback face emitted; woff2 served from same origin (200); 0 Google Fonts requests`,
  );
});

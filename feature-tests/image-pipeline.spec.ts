import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('<Image>: srcset widths, intrinsic size, lazy offscreen, modern format', async ({ page, request }) => {
  await page.goto('/feature-tests/image-pipeline');
  const hero = page.getByTestId('hero');
  const off = page.getByTestId('offscreen');

  const srcset = (await hero.getAttribute('srcset')) ?? '';
  const widths = [...srcset.matchAll(/\s(\d+)w/g)].map(m => Number(m[1]));
  expect(widths.length).toBeGreaterThanOrEqual(2);
  for (const img of [hero, off]) {
    await expect(img).toHaveAttribute('width', '1600');
    await expect(img).toHaveAttribute('height', '1000');
  }
  await expect(hero).toHaveAttribute('loading', 'eager');
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(off).toHaveAttribute('loading', 'lazy');

  const candidate = srcset.split(',')[0].trim().split(/\s+/)[0];
  const formats: Record<string, string> = {};
  for (const accept of ['image/avif,image/webp,*/*', 'image/webp,*/*']) {
    const res = await request.get(candidate, { headers: { Accept: accept } });
    expect(res.status()).toBe(200);
    formats[accept.split(',')[0]] = res.headers()['content-type'];
  }
  expect(Object.values(formats).some(t => t === 'image/avif' || t === 'image/webp')).toBe(true);
  // Natural size of the decoded hero proves a resized variant was served.
  await expect.poll(() => hero.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  const natural = await hero.evaluate((el: HTMLImageElement) => el.naturalWidth);
  expect(natural).toBeLessThan(1600 * 2);
  evidence(
    `srcset widths [${widths.join(',')}], width/height=1600x1000, offscreen loading=lazy, hero eager+fetchpriority=high; ${candidate.split('&')[0]}… returns ${JSON.stringify(formats)}; hero decoded at ${natural}px`,
  );
});

import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('<Script strategy="idle"> loads after hydration without blocking render', async ({ page, request }) => {
  const html = await (await request.get('/feature-tests/third-party-scripts')).text();
  // Not in the server HTML at all, so it cannot be parser-blocking.
  expect(html).not.toMatch(/<script[^>]*third-party\.js/);

  let requestedAt = 0;
  page.on('request', r => {
    if (r.url().endsWith('/ft/third-party.js')) requestedAt = Date.now();
  });
  const start = Date.now();
  await page.goto('/feature-tests/third-party-scripts', { waitUntil: 'domcontentloaded' });
  const dclAt = Date.now();
  const loaded = await page.waitForFunction(() => (window as unknown as { __ftThirdPartyLoaded?: unknown }).__ftThirdPartyLoaded, null, {
    timeout: 15_000,
  });
  const info = (await loaded.jsonValue()) as { at: number; readyState: string };
  const tag = await page.$eval('script#ft-third-party', el => ({
    inHead: el.parentElement === document.head,
    src: el.getAttribute('src'),
  }));
  expect(tag.src).toBe('/ft/third-party.js');
  expect(requestedAt).toBeGreaterThanOrEqual(start);
  expect(info.readyState).not.toBe('loading');
  evidence(
    `script absent from SSR HTML; injected by <Script> (#ft-third-party) ${requestedAt - start}ms after navigation start (DOMContentLoaded at ${dclAt - start}ms); ran with document.readyState=${info.readyState}`,
  );
});

import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('<Link prefetch="intent|viewport"> fetches target before click', async ({ page }) => {
  const log: { url: string; t: number; type: string }[] = [];
  page.on('request', r => {
    if (r.url().includes('-target')) log.push({ t: Date.now(), type: r.resourceType(), url: r.url() });
  });
  await page.goto('/feature-tests/route-prefetching');
  await page.waitForLoadState('networkidle');
  expect(log.filter(r => r.url.includes('intent-target'))).toEqual([]);
  expect(log.filter(r => r.url.includes('viewport-target'))).toEqual([]);

  await page.getByTestId('intent-link').hover();
  await expect.poll(() => log.filter(r => r.url.includes('intent-target')).length).toBeGreaterThan(0);
  const intentReq = log.find(r => r.url.includes('intent-target'))!;

  await page.getByTestId('viewport-link').scrollIntoViewIfNeeded();
  await expect.poll(() => log.filter(r => r.url.includes('viewport-target')).length).toBeGreaterThan(0);
  const viewportReq = log.find(r => r.url.includes('viewport-target'))!;

  const before = log.length;
  const clickAt = Date.now();
  await page.getByTestId('viewport-link').click();
  await expect(page.getByTestId('target-heading')).toBeVisible();
  expect(intentReq.t).toBeLessThan(clickAt);
  expect(viewportReq.t).toBeLessThan(clickAt);
  evidence(
    `hover → ${intentReq.type} ${new URL(intentReq.url).pathname}; scroll-into-view → ${viewportReq.type} ${new URL(viewportReq.url).pathname}; both before click; ${log.length - before} extra target request(s) on click`,
  );
});

import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('@preact/signals text binding updates without re-rendering the component', async ({ page }) => {
  await page.goto('/feature-tests/reactivity');
  await page.waitForFunction(() => (window as unknown as { __ftRenders?: number }).__ftRenders === 1);
  const count = page.getByTestId('count');
  await expect(async () => {
    await page.getByTestId('increment').click();
    await expect(count).not.toHaveText('0', { timeout: 500 });
  }).toPass();
  const before = await count.textContent();
  await page.getByTestId('increment').click();
  await page.getByTestId('increment').click();
  await expect(count).toHaveText(String(Number(before) + 2));
  const renders = await page.evaluate(() => (window as unknown as { __ftRenders: number }).__ftRenders);
  expect(renders).toBe(1);
  evidence(`count text went 0 → ${Number(before) + 2} via signal; component render counter stayed at ${renders}`);
});

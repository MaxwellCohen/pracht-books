import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('route CSS is inlined in <style>, no render-blocking stylesheet link', async ({ browser, page, request }) => {
  const res = await request.get('/feature-tests/css-inlining');
  const html = await res.text();
  const head = html.split('</head>')[0];
  const styles = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  expect(styles.some(s => s.includes('.ft-css-inlining-marker')), 'route CSS inlined in <style>').toBe(true);
  expect(styles.some(s => s.includes('.ft-shell')), 'shell CSS inlined in <style>').toBe(true);
  const stylesheetLinks = [...html.matchAll(/<link[^>]+rel=["']?stylesheet[^>]*>/g)].map(m => m[0]);
  expect(stylesheetLinks).toEqual([]);

  // Without JavaScript the page is fully styled with zero CSS requests: nothing render-blocking.
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await noJs.newPage();
  const noJsCss: string[] = [];
  p2.on('request', r => r.resourceType() === 'stylesheet' && noJsCss.push(r.url()));
  await p2.goto('/feature-tests/css-inlining');
  await expect(p2.getByTestId('styled')).toHaveCSS('border-top-style', 'dashed');
  await noJs.close();
  expect(noJsCss).toEqual([]);

  // With JS, record whether the client runtime fetches the CSS files later (after first paint).
  const late: { url: string; afterDcl: boolean }[] = [];
  let dcl = false;
  page.on('domcontentloaded', () => (dcl = true));
  page.on('request', r => r.resourceType() === 'stylesheet' && late.push({ afterDcl: dcl, url: r.url() }));
  await page.goto('/feature-tests/css-inlining');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('styled')).toHaveCSS('border-top-style', 'dashed');
  evidence(
    `<style data-pracht-inline-css> holds route (.ft-css-inlining-marker) + shell CSS; 0 <link rel=stylesheet> in HTML; JS-disabled load styled with 0 CSS requests` +
      (late.length ? `; with JS the client runtime later fetches ${late.length} .css file(s) (for client navigation), not parser/render-blocking` : ''),
  );
});

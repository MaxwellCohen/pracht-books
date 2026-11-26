import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

const read = async (request: import('@playwright/test').APIRequestContext) => {
  const res = await request.get('/feature-tests/caching');
  const html = await res.text();
  return {
    isg: res.headers()['x-pracht-isg'] ?? '',
    value: Number(html.match(/data-testid="generated-at">(\d+)</)?.[1]),
  };
};

test('ISG: same value inside TTL, regenerated after timeRevalidate(5)', async ({ request }) => {
  test.setTimeout(60_000);
  // Warm: the build-time page is probably older than 5s, so this serves stale + regenerates.
  const warm = await read(request);
  await new Promise(r => setTimeout(r, 1000));
  const a = await read(request);
  const b = await read(request);
  expect(a.value).toBeGreaterThan(0);
  expect(b.value).toBe(a.value);
  expect(b.isg).not.toBe('stale');

  await new Promise(r => setTimeout(r, 6000));
  const stale = await read(request); // past TTL: stale-while-revalidate
  expect(stale.value).toBe(a.value);
  await new Promise(r => setTimeout(r, 1000));
  const fresh = await read(request);
  expect(fresh.value).toBeGreaterThan(a.value);
  evidence(
    `warm=${warm.value}(${warm.isg}); within TTL two requests both ${a.value} (${a.isg}/${b.isg}); after 6s served stale ${stale.value} (${stale.isg}) then regenerated ${fresh.value} (${fresh.isg})`,
  );
});

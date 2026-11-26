import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT } from './helpers';

const stamp = async (request: import('@playwright/test').APIRequestContext, path: string) =>
  Number((await (await request.get(path)).text()).match(/data-testid="rendered-at">(\d+)</)?.[1]);

test('render: "ssg" is prerendered and stable; render: "ssr" renders per request', async ({ request }) => {
  const file = join(ROOT, 'dist/client/feature-tests/render-modes/index.html');
  expect(existsSync(file)).toBe(true);
  const built = Number(readFileSync(file, 'utf8').match(/data-testid="rendered-at">(\d+)</)?.[1]);
  expect(existsSync(join(ROOT, 'dist/client/feature-tests/render-modes/ssr/index.html'))).toBe(false);

  const ssg1 = await stamp(request, '/feature-tests/render-modes');
  await new Promise(r => setTimeout(r, 50));
  const ssg2 = await stamp(request, '/feature-tests/render-modes');
  expect(ssg1).toBe(built);
  expect(ssg2).toBe(built);

  const ssr1 = await stamp(request, '/feature-tests/render-modes/ssr');
  await new Promise(r => setTimeout(r, 50));
  const ssr2 = await stamp(request, '/feature-tests/render-modes/ssr');
  expect(ssr2).toBeGreaterThan(ssr1);
  expect(ssr1).toBeGreaterThan(built);
  evidence(
    `ssg: dist/client/feature-tests/render-modes/index.html exists, served ${ssg1}=${ssg2}=build value; ssr: no HTML in build, timestamps ${ssr1} → ${ssr2}`,
  );
});

import { defineApp, route, timeRevalidate } from '@pracht/core';

const ft = (path: string, file: string, id: string, meta: Record<string, unknown> = {}) =>
  route(`/feature-tests${path}`, file, { id, render: 'ssg', shell: 'featureTests', ...meta });

export const app = defineApp({
  notFound: {
    component: './routes/not-found.tsx',
    shell: 'public',
  },
  routes: [
    // Framework Compare feature tests (see feature-tests/README.md). Declared before
    // `/:id` so `/feature-tests` is not treated as a book id.
    ft('', './routes/feature-tests/index.tsx', 'ft-index'),
    ft('/css-inlining', './routes/feature-tests/css-inlining.tsx', 'ft-css-inlining'),
    ft('/font-optimization', './routes/feature-tests/font-optimization.tsx', 'ft-font-optimization'),
    ft('/image-pipeline', './routes/feature-tests/image-pipeline.tsx', 'ft-image-pipeline', { hydration: 'none' }),
    ft('/caching', './routes/feature-tests/caching.tsx', 'ft-caching', {
      render: 'isg',
      revalidate: timeRevalidate(5),
    }),
    ft('/route-prefetching', './routes/feature-tests/route-prefetching.tsx', 'ft-route-prefetching'),
    ft('/route-prefetching/intent-target', './routes/feature-tests/prefetch-target.tsx', 'ft-prefetch-intent-target', {
      render: 'ssr',
    }),
    ft(
      '/route-prefetching/viewport-target',
      './routes/feature-tests/prefetch-target.tsx',
      'ft-prefetch-viewport-target',
      { render: 'ssr' },
    ),
    ft('/islands', './routes/feature-tests/islands.tsx', 'ft-islands', { hydration: 'islands' }),
    ft('/render-modes', './routes/feature-tests/render-mode.tsx', 'ft-render-modes'),
    ft('/render-modes/ssr', './routes/feature-tests/render-mode.tsx', 'ft-render-modes-ssr', { render: 'ssr' }),
    ft('/reactivity', './routes/feature-tests/reactivity.tsx', 'ft-reactivity'),
    ft('/bundle-analysis', './routes/feature-tests/bundle-analysis.tsx', 'ft-bundle-analysis', { hydration: 'none' }),
    ft('/third-party-scripts', './routes/feature-tests/third-party-scripts.tsx', 'ft-third-party-scripts'),
    ft(
      '/multi-host-deployment',
      './routes/feature-tests/multi-host-deployment.tsx',
      'ft-multi-host-deployment',
      { hydration: 'none' },
    ),
    route('/', './routes/home.tsx', {
      id: 'home',
      render: 'isg',
      shell: 'public',
      revalidate: timeRevalidate(3600),
    }),
    route('/:id', './routes/book.tsx', {
      id: 'book',
      render: 'isg',
      revalidate: timeRevalidate(3600),
      shell: 'public',
    }),
  ],
  shells: {
    featureTests: './shells/feature-tests.tsx',
    public: './shells/public.tsx',
  },
  viewTransitions: true,
});

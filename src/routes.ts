import { defineApp, route, timeRevalidate } from '@pracht/core';

export const app = defineApp({
  notFound: {
    component: './routes/not-found.tsx',
    shell: 'public',
  },
  routes: [
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
    public: './shells/public.tsx',
  },
  viewTransitions: true,
});

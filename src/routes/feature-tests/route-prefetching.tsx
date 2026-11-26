import { Link } from '@pracht/core';

// 1st-party: <Link prefetch="intent"> (hover/focus) and prefetch="viewport".
export function head() {
  return { title: 'route-prefetching · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>route-prefetching</h1>
      <p>
        <Link data-testid="intent-link" prefetch="intent" route="ft-prefetch-intent-target">
          Intent (hover) target
        </Link>
      </p>
      <div style={{ height: '2500px' }} />
      <p>
        <Link data-testid="viewport-link" prefetch="viewport" route="ft-prefetch-viewport-target">
          Viewport target
        </Link>
      </p>
    </section>
  );
}

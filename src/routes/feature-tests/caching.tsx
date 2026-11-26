import type { LoaderArgs, RouteComponentProps } from '@pracht/core';

// 1st-party: render: "isg" + revalidate: timeRevalidate(5) in src/routes.ts.
// The loader runs at build time / regeneration only; requests inside the TTL reuse it.
export function loader(_args: LoaderArgs) {
  return { generatedAt: Date.now() };
}

export function head() {
  return { title: 'caching · Pracht' };
}

export function Component({ data }: RouteComponentProps<typeof loader>) {
  return (
    <section>
      <h1>caching (ISG)</h1>
      <p>
        Generated at <time data-testid="generated-at">{data.generatedAt}</time> (revalidates after 5s).
      </p>
    </section>
  );
}

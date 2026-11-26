import type { LoaderArgs, RouteComponentProps } from '@pracht/core';

export function loader({ url }: LoaderArgs) {
  return { path: url.pathname, servedAt: Date.now() };
}

export function head() {
  return { title: 'prefetch target · Pracht' };
}

export function Component({ data }: RouteComponentProps<typeof loader>) {
  return (
    <section>
      <h1 data-testid="target-heading">Prefetch target</h1>
      <p>
        {data.path} served at {data.servedAt}
      </p>
    </section>
  );
}

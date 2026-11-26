import type { LoaderArgs, RouteComponentProps } from '@pracht/core';

// 1st-party: the same module is mounted with render: "ssg" and render: "ssr" in src/routes.ts.
export function loader({ url }: LoaderArgs) {
  return { path: url.pathname, renderedAt: Date.now() };
}

export function head() {
  return { title: 'render-modes · Pracht' };
}

export function Component({ data }: RouteComponentProps<typeof loader>) {
  return (
    <section>
      <h1>render-modes</h1>
      <p>
        <code>{data.path}</code> rendered at <time data-testid="rendered-at">{data.renderedAt}</time>
      </p>
      <p>
        <a href="/feature-tests/render-modes">SSG version</a> · <a href="/feature-tests/render-modes/ssr">SSR version</a>
      </p>
    </section>
  );
}

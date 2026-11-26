// Build-time feature: adapters from @pracht/adapter-{node,vercel,netlify,cloudflare}.
export function head() {
  return { title: 'multi-host-deployment · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>multi-host-deployment</h1>
      <p>
        <code>vite.config.ts</code> picks <code>nodeAdapter()</code> (<code>PRACHT_NODE=1</code>),{' '}
        <code>cloudflareAdapter()</code> (<code>CLOUDFLARE=1</code>), <code>netlifyAdapter()</code> (
        <code>NETLIFY=1</code>) or <code>vercelAdapter()</code> (default).
      </p>
      <p>
        The spec <code>feature-tests/multi-host-deployment.spec.ts</code> builds every target and checks the output
        directories.
      </p>
    </section>
  );
}

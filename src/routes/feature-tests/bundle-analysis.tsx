// Build-time feature: `pracht build --analyze --json` prints a per-route client JS report.
export function head() {
  return { title: 'bundle-analysis · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>bundle-analysis</h1>
      <p>
        Run <code>pracht build --analyze</code> (human table) or <code>pracht build --analyze --json</code> for a
        per-route gzip/raw client JavaScript report. Per-route <code>budgets</code> fail the build when exceeded.
      </p>
      <p>
        The spec <code>feature-tests/bundle-analysis.spec.ts</code> runs the JSON variant and writes{' '}
        <code>feature-tests/out/bundle-report.json</code>.
      </p>
    </section>
  );
}

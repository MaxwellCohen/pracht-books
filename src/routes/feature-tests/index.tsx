export const FEATURES = [
  ['css-inlining', 'ft-css-inlining'],
  ['font-optimization', 'ft-font-optimization'],
  ['image-pipeline', 'ft-image-pipeline'],
  ['caching', 'ft-caching'],
  ['route-prefetching', 'ft-route-prefetching'],
  ['islands', 'ft-islands'],
  ['render-modes', 'ft-render-modes'],
  ['reactivity', 'ft-reactivity'],
  ['bundle-analysis', 'ft-bundle-analysis'],
  ['third-party-scripts', 'ft-third-party-scripts'],
  ['multi-host-deployment', 'ft-multi-host-deployment'],
] as const;

export function head() {
  return { title: 'Feature tests · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>Pracht feature tests</h1>
      <p>One page per Framework Compare performance feature. Specs live in <code>feature-tests/</code>.</p>
      <ul>
        {FEATURES.map(([name, id]) => (
          <li key={id}>
            <a data-route-id={id} href={`/feature-tests/${name}`}>
              {name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

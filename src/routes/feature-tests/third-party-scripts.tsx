import { Script } from '@pracht/core';

// 1st-party: <Script strategy="idle"> from @pracht/core injects the script in
// requestIdleCallback after hydration, so it never blocks first render.
export function head() {
  return { title: 'third-party-scripts · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>third-party-scripts</h1>
      <p>
        <code>/ft/third-party.js</code> is loaded with <code>&lt;Script strategy="idle"&gt;</code>.
      </p>
      <Script id="ft-third-party" src="/ft/third-party.js" strategy="idle" />
    </section>
  );
}

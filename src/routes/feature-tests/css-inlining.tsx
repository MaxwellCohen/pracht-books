import './css-inlining.css';

// 1st-party: `pracht({ inlineCss: true })` in vite.config.ts inlines the matched
// route + shell CSS into a <style> tag instead of <link rel="stylesheet">.
export function head() {
  return { title: 'css-inlining · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>css-inlining</h1>
      <p class="ft-css-inlining-marker" data-testid="styled">
        This box is styled by <code>css-inlining.css</code>, which <code>inlineCss: true</code> inlines into the
        document head.
      </p>
    </section>
  );
}

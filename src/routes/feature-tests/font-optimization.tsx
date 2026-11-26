import { ftMono } from '@/lib/ft-fonts';

// 1st-party: defineFont() from @pracht/core + head().fonts emits @font-face
// (font-display), a <link rel="preload" as="font">, and an adjusted fallback face.
export function head() {
  return { fonts: [ftMono], title: 'font-optimization · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>font-optimization</h1>
      <p class={ftMono.className} data-testid="font-text">
        This paragraph uses the self-hosted “FT Geist Mono” font defined with <code>defineFont()</code>.
      </p>
    </section>
  );
}

import { defineFont } from '@pracht/core';

// Self-hosted file copied into public/fonts (from @fontsource-variable/geist-mono).
export const ftMono = defineFont({
  display: 'swap',
  fallbacks: ['Courier New', 'monospace'],
  family: 'FT Geist Mono',
  sizeAdjust: '100%',
  src: '/fonts/geist-mono-latin-wght-normal.woff2',
  weight: '100 900',
});

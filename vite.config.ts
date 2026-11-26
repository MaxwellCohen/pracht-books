import { fileURLToPath } from 'node:url';
import { cloudflareAdapter } from '@pracht/adapter-cloudflare';
import { netlifyAdapter } from '@pracht/adapter-netlify';
import { nodeAdapter } from '@pracht/adapter-node';
import { vercelAdapter } from '@pracht/adapter-vercel';
import { prachtImage } from '@pracht/image/vite';
import { pracht } from '@pracht/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const isCloudflare = Boolean(process.env.CLOUDFLARE || process.env.WORKERS_CI || process.env.CF_PAGES);
// PRACHT_NODE=1 builds a self-hosted Node server (used by `npm run test:features`
// to serve the production build locally on one port).
const isNode = Boolean(process.env.PRACHT_NODE);
const adapter = isNode
  ? nodeAdapter()
  : isCloudflare
    ? cloudflareAdapter()
    : process.env.NETLIFY
      ? netlifyAdapter()
      : vercelAdapter();
const imageTarget = isNode ? 'node' : isCloudflare ? 'cloudflare' : process.env.NETLIFY ? 'netlify' : 'vercel';
process.env.PRACHT_PUBLIC_IMAGE_TARGET = imageTarget;
const imageHandler = fileURLToPath(
  new URL(
    isCloudflare && process.env.NODE_ENV === 'production'
      ? './src/lib/cloudflare-image.ts'
      : './src/lib/node-image.ts',
    import.meta.url,
  ),
);

export default defineConfig({
  plugins: [prachtImage(), pracht({ adapter, inlineCss: true, llmsTxt: {} }), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@image-handler': imageHandler,
    },
  },
});

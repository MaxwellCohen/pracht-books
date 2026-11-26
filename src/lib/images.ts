import { publicEnv } from '@pracht/core';
import { configureImage, defaultLoader, netlifyLoader, vercelLoader, type ImageLoader } from '@pracht/image';

const loaders = {
  cloudflare: defaultLoader,
  netlify: netlifyLoader,
  vercel: vercelLoader,
} satisfies Record<string, ImageLoader>;

// Dev uses the sharp endpoint. Production follows the adapter:
// Vercel Image Optimization, Netlify Image CDN, and Cloudflare Image
// Transformations through `/api/_pracht/image` (`fetch` `cf.image`). That
// path works on workers.dev. `/cdn-cgi/image` only works on a zone that has
// transformations enabled.
function productionLoader(): ImageLoader {
  const target = publicEnv.PRACHT_PUBLIC_IMAGE_TARGET;
  if (target === 'cloudflare' || target === 'netlify' || target === 'vercel') return loaders[target];
  if (target === 'node') return defaultLoader; // self-hosted sharp endpoint (/api/_pracht/image)
  return vercelLoader;
}

configureImage(import.meta.env.DEV ? {} : { loader: productionLoader() });

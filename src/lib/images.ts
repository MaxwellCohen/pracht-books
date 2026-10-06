import { publicEnv } from '@pracht/core';
import { configureImage, defaultLoader, vercelLoader, type ImageLoader, type ImageLoaderArgs } from '@pracht/image';

function netlifyLoader({ quality = 75, src, width }: ImageLoaderArgs) {
  const params = new URLSearchParams({
    q: String(quality),
    url: src,
    w: String(width),
  });
  return `/.netlify/images?${params.toString()}`;
}

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
  return vercelLoader;
}

configureImage(import.meta.env.DEV ? {} : { loader: productionLoader() });

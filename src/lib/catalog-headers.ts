import { CATALOG_CACHE_EXPIRE_SECONDS, CATALOG_CACHE_REVALIDATE_SECONDS } from '@/lib/catalog-cache';

/**
 * Catalog (SSR) document headers. Browsers always revalidate (max-age=0); shared caches
 * keep each URL for an hour and serve it stale while refreshing. Vercel's CDN honors
 * s-maxage; the Pracht Netlify adapter turns a `public` Cache-Control on an SSR route
 * into Netlify-CDN-Cache-Control (durable) keyed on the query string. Book pages use
 * ISG and the adapters' own headers.
 */
export function catalogDocumentHeaders(): HeadersInit {
  return {
    'Cache-Control': `public, max-age=0, s-maxage=${CATALOG_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=${CATALOG_CACHE_EXPIRE_SECONDS}`,
  };
}

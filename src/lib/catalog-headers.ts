import { CATALOG_CACHE_EXPIRE_SECONDS, CATALOG_CACHE_REVALIDATE_SECONDS } from '@/lib/catalog-cache';

/**
 * Catalog (SSR) document headers. Browsers always revalidate; the platform CDN keeps
 * each URL (query string included) for an hour and serves it stale while refreshing.
 * Vercel and Netlify read `CDN-Cache-Control`; Netlify's `durable` directive shares
 * the entry across its edge nodes. Book pages use ISG and the adapters' own headers.
 */
export function catalogDocumentHeaders(): HeadersInit {
  const cdn = `public, s-maxage=${CATALOG_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=${CATALOG_CACHE_EXPIRE_SECONDS}`;
  return {
    'CDN-Cache-Control': cdn,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-CDN-Cache-Control': `${cdn}, durable`,
  };
}

import { hostDocumentCacheControl } from '@/lib/catalog-cache';

export function catalogDocumentHeaders(): HeadersInit {
  return {
    'Cache-Control': hostDocumentCacheControl(),
  };
}

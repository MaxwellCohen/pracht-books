import { DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from '@pracht/image';
import { BOOK_IMAGE_HOSTS } from '@/lib/image-sources';

const ALLOWED_HOSTS = new Set<string>(BOOK_IMAGE_HOSTS);
const ALLOWED_WIDTHS = new Set<number>([...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES]);
const CACHE_CONTROL = 'public, max-age=14400, must-revalidate';
const MAX_WIDTH = 3840;

type ImageFormat = 'avif' | 'webp' | 'jpeg';

type HandlerArgs = {
  request: Request;
  signal?: AbortSignal;
};

type ImageTransform = {
  fit: 'scale-down';
  format: ImageFormat;
  metadata: 'none';
  quality: number;
  width: number;
};

export function cloudflareImageHandler({ request, signal }: HandlerArgs): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Promise.resolve(
      new Response('Method Not Allowed', { headers: { allow: 'GET, HEAD' }, status: 405 }),
    );
  }

  const source = new URL(request.url).searchParams;
  const target = allowedImageUrl(source.get('url'));
  if (target instanceof Response) return Promise.resolve(target);

  const width = allowedWidth(source.get('w'));
  if (width instanceof Response) return Promise.resolve(width);

  const quality = allowedQuality(source.get('q'));
  if (quality instanceof Response) return Promise.resolve(quality);

  return fetchOptimized(request, target, { quality, signal, width });
}

function allowedImageUrl(source: string | null): URL | Response {
  if (!source) return errorResponse(400, 'Missing required "url" query parameter.');
  if (source.startsWith('//')) return errorResponse(400, 'Protocol-relative "url" values are not allowed.');

  let target: URL;
  try {
    target = new URL(source);
  } catch {
    return errorResponse(400, 'The "url" parameter must be an absolute https URL.');
  }

  if (target.protocol !== 'https:' || target.username || target.password || !ALLOWED_HOSTS.has(target.hostname)) {
    return errorResponse(403, 'Remote image host is not allowed.');
  }

  return target;
}

function allowedWidth(widthParam: string | null): number | Response {
  if (!widthParam) return errorResponse(400, 'Missing required "w" query parameter.');
  const width = Number(widthParam);
  if (!Number.isInteger(width) || width <= 0) return errorResponse(400, 'The "w" parameter must be a positive integer.');
  if (width > MAX_WIDTH) return errorResponse(400, `The "w" parameter may not exceed ${MAX_WIDTH}.`);
  if (!ALLOWED_WIDTHS.has(width)) return errorResponse(400, `The width ${width} is not allowed.`);
  return width;
}

function allowedQuality(qualityParam: string | null): number | Response {
  if (qualityParam === null) return 75;
  const quality = Number(qualityParam);
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
    return errorResponse(400, 'The "q" parameter must be an integer between 1 and 100.');
  }
  return quality;
}

async function fetchOptimized(
  request: Request,
  target: URL,
  { quality, signal, width }: { quality: number; signal?: AbortSignal; width: number },
): Promise<Response> {
  const image: ImageTransform = {
    fit: 'scale-down',
    format: negotiatedFormat(request.headers.get('accept') ?? ''),
    metadata: 'none',
    quality,
    width,
  };

  let upstream: Response;
  try {
    upstream = await fetch(new Request(target), { cf: { image }, signal } as RequestInit);
  } catch {
    return errorResponse(502, 'Failed to fetch source image.');
  }

  if (!upstream.ok) return errorResponse(502, `Source image responded with ${upstream.status}.`);

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('cache-control', CACHE_CONTROL);
  headers.set('vary', 'Accept');
  headers.set('x-content-type-options', 'nosniff');

  if (request.method === 'HEAD') {
    await upstream.body?.cancel();
    return new Response(null, { headers, status: upstream.status });
  }

  return new Response(upstream.body, { headers, status: upstream.status });
}

function negotiatedFormat(accept: string): ImageFormat {
  if (accepts(accept, 'image/avif')) return 'avif';
  if (accepts(accept, 'image/webp')) return 'webp';
  return 'jpeg';
}

function accepts(accept: string, format: string) {
  return accept
    .split(',')
    .some(part => part.split(';')[0]?.trim().toLowerCase() === format);
}

export const imageHandler = cloudflareImageHandler;

function errorResponse(status: number, message: string) {
  return new Response(message, {
    headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' },
    status,
  });
}

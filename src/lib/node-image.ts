import type { ApiRouteHandler } from '@pracht/core';
import { createImageHandler } from '@pracht/image/node';
import { bookImageRemotePatterns } from '@/lib/image-sources';

const handler = createImageHandler({
  localOrigin: process.env.PRACHT_ORIGIN ?? 'http://localhost:3000',
  remotePatterns: bookImageRemotePatterns,
});

export const imageHandler: ApiRouteHandler = args => handler(args);

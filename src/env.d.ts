/// <reference types="@pracht/image/client" />
import '@pracht/core';

declare module '@pracht/core' {
  interface Register {
    env: {
      API_DELAY_MS?: string;
      POSTGRES_URL?: string;
      PRACHT_PUBLIC_IMAGE_TARGET?: 'cloudflare' | 'netlify' | 'vercel';
    };
  }
}

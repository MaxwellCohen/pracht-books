export const BOOK_IMAGE_HOSTS = ['images.gr-assets.com', 's.gr-assets.com'] as const;

export const bookImageRemotePatterns = BOOK_IMAGE_HOSTS.map(hostname => ({
  hostname,
  protocol: 'https' as const,
}));

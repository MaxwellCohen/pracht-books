import { Image } from '@pracht/image';
import '@/lib/images';
import sample from './sample.jpg?pracht';

// 1st-party: @pracht/image <Image> + prachtImage() vite plugin (`?pracht` import gives
// intrinsic size + blur placeholder). Under the node adapter the default loader points at
// the sharp-backed endpoint in src/api/_pracht/image.ts, which negotiates AVIF/WebP.
export function head() {
  return { title: 'image-pipeline · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>image-pipeline</h1>
      <Image alt="Hero (priority)" data-testid="hero" placeholder="blur" priority sizes="(max-width: 768px) 100vw, 768px" src={sample} />
      <div style={{ height: '2200px' }} />
      <Image alt="Offscreen (lazy)" data-testid="offscreen" sizes="(max-width: 768px) 100vw, 768px" src={sample} />
    </section>
  );
}

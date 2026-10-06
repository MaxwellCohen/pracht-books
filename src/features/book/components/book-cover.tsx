import { Image } from '@pracht/image';
import { useState } from 'preact/hooks';
import { EMPTY_IMAGE_URL, getLargeBookImageUrl } from '@/features/book/book-constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { thumbHashToDataURL } from 'thumbhash';
import '@/lib/images';

type Props = {
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string | null;
  thumbhash: string | null;
  title: string;
};

function thumbhashUrl(hash: string | null) {
  if (!hash) return undefined;
  try {
    const binary = atob(hash);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return thumbHashToDataURL(bytes);
  } catch {
    return undefined;
  }
}

export function BookCover({ className, priority, sizes, src, thumbhash, title }: Props) {
  const resolved = getLargeBookImageUrl(src ?? EMPTY_IMAGE_URL);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const unavailable = failedSrc === resolved;
  const placeholder = thumbhashUrl(thumbhash);

  return (
    <div className={cn('bg-card dark:bg-card-dark relative aspect-[2/3] w-full overflow-hidden rounded-md', className)}>
      {unavailable ? (
        <div
          aria-label={`Cover unavailable for ${title}`}
          className="text-muted absolute inset-0 flex items-center justify-center p-3 text-center text-sm"
          role="img"
        >
          Cover unavailable
        </div>
      ) : (
        <Image
          alt={title}
          blurDataURL={placeholder}
          className="size-full object-cover"
          fill
          onError={() => setFailedSrc(resolved)}
          placeholder={placeholder ? 'blur' : 'empty'}
          priority={priority}
          sizes={sizes}
          src={resolved}
        />
      )}
    </div>
  );
}

export function BookCoverSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('skeleton-subtle aspect-[2/3] w-full rounded-md', className)} />;
}

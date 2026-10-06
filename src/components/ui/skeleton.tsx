import { cn } from '@/lib/utils';
import type { CSSProperties } from 'preact';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cn('skeleton-animation block', className)} style={style} />;
}

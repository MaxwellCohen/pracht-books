import type { IslandProps } from '@pracht/core';
import { useState } from 'preact/hooks';

export default function FtCounter({ start = 0 }: { start?: number } & IslandProps) {
  const [count, setCount] = useState(start);
  return (
    <button data-testid="island-button" onClick={() => setCount(c => c + 1)} type="button">
      Island clicks: <span data-testid="island-count">{count}</span>
    </button>
  );
}

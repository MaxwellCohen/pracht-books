import FtCounter from '@/islands/ft-counter';
import { StaticBlurb } from './islands-static';

// 1st-party: hydration: "islands" in src/routes.ts; only src/islands/* components hydrate.
export function head() {
  return { title: 'islands · Pracht' };
}

export function Component() {
  return (
    <section>
      <h1>islands</h1>
      <StaticBlurb />
      <FtCounter client="load" start={0} />
    </section>
  );
}

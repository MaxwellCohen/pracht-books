import { useSignal } from '@preact/signals';

// 1st-party (Preact team): @preact/signals. Passing the signal itself into JSX binds it
// to a text node, so updates patch the text without re-running this component.
let renders = 0;

export function head() {
  return { title: 'reactivity · Pracht' };
}

export function Component() {
  renders++;
  if (typeof window !== 'undefined') (window as unknown as { __ftRenders: number }).__ftRenders = renders;
  const count = useSignal(0);
  return (
    <section>
      <h1>reactivity</h1>
      <p>
        Count: <span data-testid="count">{count}</span>
      </p>
      <button data-testid="increment" onClick={() => count.value++} type="button">
        Increment
      </button>
    </section>
  );
}

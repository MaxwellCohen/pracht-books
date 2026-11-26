import type { ShellProps } from '@pracht/core';
import '../styles/feature-tests.css';

// Minimal shell for /feature-tests/* so each feature page carries only its own code.
export function Shell({ children }: ShellProps) {
  return (
    <main class="ft-shell">
      <p>
        <a href="/feature-tests">Feature tests</a> · <a href="/">Books</a>
      </p>
      {children}
    </main>
  );
}

export function head() {
  return {
    lang: 'en',
    meta: [{ content: 'width=device-width, initial-scale=1', name: 'viewport' }],
    title: 'Pracht feature tests',
  };
}

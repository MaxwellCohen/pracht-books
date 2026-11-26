import { execSync } from 'node:child_process';
import { test } from '@playwright/test';

export const ROOT = new URL('..', import.meta.url).pathname;

/** Attach a one-line evidence string; run.mjs copies it into results.json. */
export function evidence(text: string) {
  test.info().annotations.push({ description: text, type: 'evidence' });
}

export function sh(cmd: string, env: Record<string, string> = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, POSTGRES_URL: '', ...env },
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

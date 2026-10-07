import { ErrorBoundary } from '@pracht/core';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { GitHubIcon } from '@/components/ui/github-icon';
import { ApiDelay } from '@/features/book/components/api-delay';
import { BookFilters } from '@/features/book/components/book-filters';
import { CatalogSize } from '@/features/book/components/catalog-size';
import { HomeLink } from '@/features/book/components/home-link';

export function BookSidebar({ idPrefix, mobile = false }: { idPrefix: string; mobile?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <HomeLink />
      </div>
      <div className="border-divider dark:border-divider-dark mt-6 border-b pb-5">
        <CatalogSize />
      </div>
      <div className="mt-5 mb-4">
        <ApiDelay idPrefix={idPrefix} />
      </div>
      <p className="text-muted mb-4 text-xs font-semibold tracking-wide uppercase">Filters</p>
      <ErrorBoundary
        fallback={(_error, retry) => (
          <ErrorState compact title="Filters unavailable">
            <Button className="mt-1" onClick={retry} size="sm" variant="secondary">
              Try again
            </Button>
          </ErrorState>
        )}
      >
        <BookFilters idPrefix={idPrefix} />
      </ErrorBoundary>
      {mobile ? null : (
        <div className="border-divider dark:border-divider-dark mt-4 flex items-center justify-between gap-2 border-t pt-4">
          <ThemeToggle variant="inline" />
          <a
            aria-label="View source on GitHub"
            className="text-muted rounded-full p-1.5 transition-colors hover:text-black dark:hover:text-white"
            href="https://github.com/MaxwellCohen/pracht-books"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      )}
    </>
  );
}

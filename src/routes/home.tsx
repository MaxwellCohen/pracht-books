import {
  defer,
  Suspense,
  use,
  type ErrorBoundaryProps,
  type HeadersArgs,
  type LoaderArgs,
  type RouteComponentProps,
} from '@pracht/core';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { getBooksCount, getBooksPage } from '@/features/book/book-queries';
import { toBookFilters, toBookQuery } from '@/features/book/book-utils';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { waitForApiDelay } from '@/lib/api-delay';
import { catalogDocumentHeaders } from '@/lib/catalog-headers';
import { getApiDelayMs, searchParamsFromUrl } from '@/lib/url-state';

export function loader({ url }: LoaderArgs) {
  const searchParams = searchParamsFromUrl(url.searchParams);
  const query = toBookQuery(searchParams);
  const ready = waitForApiDelay(getApiDelayMs(searchParams));

  return {
    books: defer(ready.then(() => getBooksPage(query))),
    searchParams,
    totalResults: defer(ready.then(() => getBooksCount(toBookFilters(query)))),
  };
}

export function headers(_args: HeadersArgs<typeof loader>) {
  return catalogDocumentHeaders();
}

export function head() {
  return { title: 'Books · Pracht Books' };
}

function HomeBooks({ data }: Pick<RouteComponentProps<typeof loader>, 'data'>) {
  return <BookGrid books={use(data.books)} searchParams={data.searchParams} />;
}

function HomePagination({ data }: Pick<RouteComponentProps<typeof loader>, 'data'>) {
  return <BookPagination searchParams={data.searchParams} totalResults={use(data.totalResults)} />;
}

export function Component({ data }: RouteComponentProps<typeof loader>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
        <Suspense fallback={<BookGridSkeleton />}>
          <HomeBooks data={data} />
        </Suspense>
      </div>
      <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
        <Suspense fallback={<BookPaginationSkeleton />}>
          <HomePagination data={data} />
        </Suspense>
      </footer>
    </div>
  );
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <ErrorState body={error.message} title="Can't load books">
      <Button className="mt-1" onClick={() => window.location.reload()} size="sm" variant="secondary">
        Try again
      </Button>
    </ErrorState>
  );
}

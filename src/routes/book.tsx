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
import { GENERATED_PREVIEW_BOOKS } from '@/features/book/book-preview-catalog';
import { getBookById } from '@/features/book/book-queries';
import { SAMPLE_BOOKS } from '@/features/book/data/sample-books';
import { getDb } from '@/lib/db/drizzle';
import { books } from '@/lib/db/schema';
import { BackToBooksLink } from '@/features/book/components/back-to-books-link';
import { BookDetail, BookDetailSkeleton } from '@/features/book/components/book-detail';
import { waitForApiDelay } from '@/lib/api-delay';
import { catalogDocumentHeaders } from '@/lib/catalog-headers';
import { getApiDelayMs, searchParamsFromUrl } from '@/lib/url-state';

const ISR_PATH_LIMIT = 100;

export async function getStaticPaths() {
  const database = getDb();
  if (database) {
    const rows = await database.select({ id: books.id }).from(books).orderBy(books.id).limit(ISR_PATH_LIMIT);
    if (rows.length > 0) return rows.map(row => ({ id: String(row.id) }));
  }

  return [...SAMPLE_BOOKS, ...GENERATED_PREVIEW_BOOKS].map(book => ({ id: String(book.id) }));
}

export function loader({ params, url }: LoaderArgs) {
  const searchParams = searchParamsFromUrl(url.searchParams);
  const ready = waitForApiDelay(getApiDelayMs(searchParams));

  return {
    book: defer(ready.then(() => getBookById(params.id ?? ''))),
    searchParams,
  };
}

export function headers(_args: HeadersArgs<typeof loader>) {
  return catalogDocumentHeaders();
}

export function head() {
  return { title: 'Book · Pracht Books' };
}

function BookDetailBody({ data }: Pick<RouteComponentProps<typeof loader>, 'data'>) {
  return <BookDetail book={use(data.book)} />;
}

export function Component({ data }: RouteComponentProps<typeof loader>) {
  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <BackToBooksLink className="mb-6" />
      <Suspense fallback={<BookDetailSkeleton />}>
        <BookDetailBody data={data} />
      </Suspense>
    </div>
  );
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <ErrorState body={error.message} title="Can't load this book">
      <Button className="mt-1" onClick={() => window.location.reload()} size="sm" variant="secondary">
        Try again
      </Button>
    </ErrorState>
  );
}

import { and, count, eq, gte, isNull, lte, not, sql } from 'drizzle-orm';
import { EMPTY_IMAGE_URL, ITEMS_PER_PAGE, MIN_RATING, MIN_YEAR } from '@/features/book/book-constants';
import { GENERATED_PREVIEW_BOOKS } from '@/features/book/book-preview-catalog';
import type { BookFilters, BookQuery } from '@/features/book/book-utils';
import { SAMPLE_BOOKS } from '@/features/book/data/sample-books';
import { getDb } from '@/lib/db/drizzle';
import { authors, books, bookToAuthor } from '@/lib/db/schema';

export type BookSummary = {
  id: number;
  title: string;
  image_url: string | null;
  thumbhash: string | null;
};

export type BookDetails = BookSummary & {
  isbn: string | null;
  publisher: string | null;
  description: string | null;
  num_pages: number | null;
  language_code: string | null;
  ratings_count: number | null;
  publication_year: number | null;
  average_rating: string | null;
  authors: string[];
};

const previewBooks: BookDetails[] = [...SAMPLE_BOOKS, ...GENERATED_PREVIEW_BOOKS];

const yearFilter = (year: number) => and(gte(books.publication_year, MIN_YEAR), lte(books.publication_year, year));

const ratingFilter = (rating: number) => (rating > MIN_RATING ? sql`${books.average_rating} >= ${rating}` : undefined);

const languageFilter = (language: string) => {
  if (!language) return undefined;
  if (language === 'en') return sql`${books.language_code} IN ('eng', 'en-US', 'en-GB')`;
  return eq(books.language_code, language);
};

const pageCountFilter = (maxPages: number) => lte(books.num_pages, maxPages);

const imageFilter = () => and(not(isNull(books.image_url)), sql`${books.image_url} != ${EMPTY_IMAGE_URL}`);

const searchFilter = (search: string) =>
  search
    ? sql`to_tsvector('english', ${books.title_tsv}) @@ (
        SELECT string_agg(quote_literal(term) || ':*', ' & ')::tsquery
        FROM unnest(tsvector_to_array(to_tsvector('english', unaccent(${search})))) AS terms(term)
      )`
    : undefined;

const isbnFilter = (isbns: string) => {
  if (!isbns) return undefined;
  const values = isbns.split(',').map(value => value.trim());
  return sql`${books.isbn} IN (${sql.join(
    values.map(value => sql`${value}`),
    sql`, `,
  )})`;
};

function getWhereClause({ isbns, language, maxPages, rating, search, year }: BookFilters) {
  const filters = [
    yearFilter(year),
    ratingFilter(rating),
    languageFilter(language),
    pageCountFilter(maxPages),
    imageFilter(),
    searchFilter(search),
    isbnFilter(isbns),
  ].filter(filter => filter !== undefined);

  return filters.length ? and(...filters) : undefined;
}

function filterPreview({ isbns, language, maxPages, rating, search, year }: BookFilters): BookDetails[] {
  const query = search.toLocaleLowerCase();
  const isbnList = isbns ? isbns.split(',') : undefined;

  return previewBooks.filter(book => {
    const matchesQuery = !query || book.title.toLocaleLowerCase().includes(query);
    const matchesLanguage =
      !language ||
      (language === 'en'
        ? ['eng', 'en-US', 'en-GB'].includes(book.language_code ?? '')
        : book.language_code === language);

    return (
      matchesQuery &&
      matchesLanguage &&
      book.image_url !== EMPTY_IMAGE_URL &&
      (!isbnList || (!!book.isbn && isbnList.includes(book.isbn))) &&
      (book.publication_year ?? 0) >= MIN_YEAR &&
      (book.publication_year ?? Infinity) <= year &&
      Number(book.average_rating ?? 0) >= rating &&
      (book.num_pages ?? 0) <= maxPages
    );
  });
}

function getPreviewBooks(query: BookQuery): BookSummary[] {
  const start = (query.page - 1) * ITEMS_PER_PAGE;
  return filterPreview(query).slice(start, start + ITEMS_PER_PAGE);
}

function getPreviewCount(filters: BookFilters): number {
  return filterPreview(filters).length;
}

async function loadBooksPage(query: BookQuery): Promise<BookSummary[]> {
  const database = getDb();
  if (!database) return getPreviewBooks(query);

  return database
    .select({
      id: books.id,
      image_url: books.image_url,
      thumbhash: books.thumbhash,
      title: books.title,
    })
    .from(books)
    .where(getWhereClause(query))
    .orderBy(books.id)
    .limit(ITEMS_PER_PAGE)
    .offset((query.page - 1) * ITEMS_PER_PAGE);
}

async function loadBooksCount(filters: BookFilters): Promise<number> {
  const database = getDb();
  if (!database) return getPreviewCount(filters);

  const [{ total }] = await database.select({ total: count() }).from(books).where(getWhereClause(filters));
  return total;
}

async function loadBookById(id: string): Promise<BookDetails | null> {
  const bookId = Number(id);
  if (!Number.isInteger(bookId)) return null;

  const database = getDb();
  if (!database) {
    return previewBooks.find(book => book.id === bookId) ?? null;
  }

  const result = await database
    .select({
      authors: sql<string[]>`array_remove(array_agg(${authors.name}), NULL)`,
      average_rating: books.average_rating,
      description: books.description,
      id: books.id,
      image_url: books.image_url,
      isbn: books.isbn,
      language_code: books.language_code,
      num_pages: books.num_pages,
      publication_year: books.publication_year,
      publisher: books.publisher,
      ratings_count: books.ratings_count,
      thumbhash: books.thumbhash,
      title: books.title,
    })
    .from(books)
    .leftJoin(bookToAuthor, eq(books.id, bookToAuthor.bookId))
    .leftJoin(authors, eq(bookToAuthor.authorId, authors.id))
    .where(eq(books.id, bookId))
    .groupBy(books.id)
    .limit(1);

  return result[0] ?? null;
}

export const getBooksPage = loadBooksPage;
export const getBooksCount = loadBooksCount;
export const getBookById = loadBookById;

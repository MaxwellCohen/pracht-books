# Pracht Books

The Goodreads catalog app, ported to [Pracht](https://pracht.resynapse.dev) and Preact.

Leave `POSTGRES_URL` empty to browse the generated preview catalog. Point it at Neon/Postgres to query the full dataset.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run preview`
- `npm run test:e2e`

## Database

- `npm run db:migrate`
- `npm run db:seed-authors`
- `npm run db:seed-books`

## Deploy

Production:

- Vercel: [pracht-books.vercel.app](https://pracht-books.vercel.app)
- Netlify: [pracht-books.netlify.app](https://pracht-books.netlify.app)
- Cloudflare: [pracht-books.to-email-max.workers.dev](https://pracht-books.to-email-max.workers.dev)

Vercel is the default adapter. Set `NETLIFY=1` for Netlify, or `CLOUDFLARE=1` for Cloudflare Workers:

- `npm run deploy:vercel`
- `npm run deploy:netlify`
- `npm run deploy:cloudflare`
- `npm run preview:cloudflare`

## Files

- `src/routes.ts` is the app manifest.
- `src/routes/home.tsx` is the catalog.
- `src/routes/book.tsx` is the book page.
- `src/shells/public.tsx` is the shared chrome.
- `src/styles/global.css` is the Tailwind CSS entry.

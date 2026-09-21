import type { ShellProps } from '@pracht/core';
import { MobileBookSidebar, MobileBookSidebarTrigger } from '@/components/mobile-book-sidebar';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { BookSearch } from '@/features/book/components/book-search';
import { BookSidebar } from '@/features/book/components/book-sidebar';
import '../styles/global.css';

const description =
  'Browse two million Goodreads books with Pracht, Preact, streaming search, and URL-driven filters.';

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((t==="system"||!t)&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function Shell({ children }: ShellProps) {
  return (
    <ThemeProvider>
      <MobileBookSidebar sidebar={<BookSidebar idPrefix="mobile" mobile />}>
        <div className="group flex min-h-dvh">
          <aside
            className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-5 py-5 md:flex"
            style={{ viewTransitionName: 'sidebar' }}
          >
            <BookSidebar idPrefix="desktop" />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header
              className="border-divider bg-surface/80 dark:border-divider-dark dark:bg-surface-dark/80 sticky top-0 z-20 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:gap-3 sm:px-6"
              style={{ viewTransitionName: 'site-header' }}
            >
              <MobileBookSidebarTrigger />
              <BookSearch />
            </header>

            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </div>
        </div>
      </MobileBookSidebar>
    </ThemeProvider>
  );
}

export function head() {
  return {
    lang: 'en',
    link: [
      { href: '/icon.svg', rel: 'icon', type: 'image/svg+xml' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400&display=swap',
      },
    ],
    meta: [
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { content: description, name: 'description' },
      { content: '#fafafa', media: '(prefers-color-scheme: light)', name: 'theme-color' },
      { content: '#121212', media: '(prefers-color-scheme: dark)', name: 'theme-color' },
      { content: description, property: 'og:description' },
      { content: 'Pracht Books', property: 'og:site_name' },
      { content: 'Pracht Books', property: 'og:title' },
      { content: 'website', property: 'og:type' },
    ],
    script: [{ children: themeScript }],
    title: 'Pracht Books',
  };
}

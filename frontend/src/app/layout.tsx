import SessionGuard from '@/components/authentication/SessionGuard';
import '@/styles/tailwind.css';
import '@/styles/custom.css';
import type { Metadata } from 'next';
import type React from 'react';
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: {
    template: '%s - Catalyst',
    default: 'Catalyst',
  },
  description: '',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="text-zinc-950 antialiased dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
    >
      <head>
        <link
          rel="preconnect"
          href="https://rsms.me/"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://rsms.me/inter/inter.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <SessionGuard>{children}</SessionGuard>
        </Providers>
      </body>
    </html>
  );
}

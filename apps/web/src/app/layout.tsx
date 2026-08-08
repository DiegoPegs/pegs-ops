import type { Metadata } from 'next';

import { QueryProvider } from '@/providers/query-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pegs Ops',
  description: 'Plataforma de gestão operacional para manufatura digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

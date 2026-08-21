import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Libreng Gabay — Tamang Timpla, Tiyak na Kita | Feed Master PH',
  description:
    'I-download nang libre ang batayang gabay sa feed formulation para sa backyard farmers. Tamang timpla, tiyak na kita.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

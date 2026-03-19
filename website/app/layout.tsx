import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://github.com/dotbrains/linear-cli'),
  title: 'linear-cli — CLI for the Linear API',
  description: 'Search issues, manage comments, list labels and users, and check platform status — all from the command line. All commands output JSON.',
  openGraph: {
    title: 'linear-cli — CLI for the Linear API',
    description: 'Search issues, manage comments, list labels and users, and check platform status — all from the command line. All commands output JSON.',
    url: 'https://github.com/dotbrains/linear-cli',
    siteName: 'linear-cli',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'linear-cli — CLI for the Linear API',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'linear-cli — CLI for the Linear API',
    description: 'Search issues, manage comments, list labels and users, and check platform status — all from the command line. All commands output JSON.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Rutwik Patel | Software Engineer',
  description: 'Software Engineer at Sigma Computing. Full Stack Developer specializing in React, TypeScript, and AI/ML.',
  keywords: ['Software Engineer', 'Full Stack Developer', 'React', 'TypeScript', 'AI', 'Machine Learning'],
  authors: [{ name: 'Rutwik Patel' }],
  openGraph: {
    title: 'Rutwik Patel | Software Engineer',
    description: 'Software Engineer at Sigma Computing. Full Stack Developer specializing in React, TypeScript, and AI/ML.',
    url: 'https://www.rutwik.dev',
    siteName: 'Rutwik Patel Portfolio',
    type: 'website',
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
        <link rel="icon" href="/myimg/favicon.png" type="image/x-icon" />
      </head>
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}


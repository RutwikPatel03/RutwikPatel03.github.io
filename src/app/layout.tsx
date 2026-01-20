import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
      <body className={poppins.variable}>
        {children}

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />

        {/* Apollo Tracking Script */}
        <Script
          id="apollo-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function initApollo(){
                var n=Math.random().toString(36).substring(7),
                    o=document.createElement("script");
                o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n;
                o.async=true;
                o.defer=true;
                o.onload=function(){
                  window.trackingFunctions.onLoad({appId:"67df2cb5e21e0c001dd10f3e"})
                };
                document.head.appendChild(o)
              }
              initApollo();
            `,
          }}
        />
      </body>
    </html>
  );
}


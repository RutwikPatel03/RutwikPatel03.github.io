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
  title: 'Rutwik Patel | Software Engineer | USC CS Graduate',
  description: 'Software Engineer with experience at Sigma Computing. USC MS Computer Science graduate specializing in React, TypeScript, Python, and AI/ML. Built production features used by 60+ enterprise organizations. Open to full-time opportunities.',
  keywords: [
    'Rutwik Patel',
    'Software Engineer',
    'Full Stack Developer',
    'React Developer',
    'TypeScript',
    'Python Developer',
    'AI Engineer',
    'Machine Learning Engineer',
    'USC Computer Science',
    'Sigma Computing',
    'New York Software Engineer',
    'Los Angeles Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Node.js',
    'Next.js',
    'RAG Systems',
    'LangChain',
  ],
  authors: [{ name: 'Rutwik Patel' }],
  creator: 'Rutwik Patel',
  publisher: 'Rutwik Patel',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Rutwik Patel | Software Engineer | Open to Opportunities',
    description: 'Software Engineer with experience at Sigma Computing. Built Conditional Formatting & Custom Page Headers features. USC MS CS graduate specializing in React, TypeScript, and AI/ML.',
    url: 'https://rutwik.dev',
    siteName: 'Rutwik Patel - Software Engineer Portfolio',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://rutwik.dev/myimg/my-avatar.png',
        width: 400,
        height: 400,
        alt: 'Rutwik Patel - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rutwik Patel | Software Engineer',
    description: 'Software Engineer with experience at Sigma Computing. USC MS CS graduate. Open to opportunities.',
    images: ['https://rutwik.dev/myimg/my-avatar.png'],
  },
  alternates: {
    canonical: 'https://rutwik.dev',
  },
  category: 'technology',
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

        {/* JSON-LD Structured Data for Search Engines & AI Bots */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Person',
                  '@id': 'https://rutwik.dev/#person',
                  name: 'Rutwik Patel',
                  givenName: 'Rutwik',
                  familyName: 'Patel',
                  jobTitle: 'Software Engineer',
                  description: 'Software Engineer with experience at Sigma Computing. Built production features including Conditional Formatting for Containers and Custom Page Headers. USC MS Computer Science graduate specializing in React, TypeScript, Python, and AI/ML. Seeking full-time software engineering opportunities.',
                  url: 'https://rutwik.dev',
                  image: 'https://rutwik.dev/myimg/my-avatar.png',
                  email: 'rutwikpatel1313@gmail.com',
                  telephone: '+1-213-317-0296',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Los Angeles',
                    addressRegion: 'CA',
                    addressCountry: 'US',
                  },
                  alumniOf: [
                    {
                      '@type': 'CollegeOrUniversity',
                      name: 'University of Southern California',
                      department: 'Computer Science',
                      degree: 'Master of Science in Computer Science',
                      startDate: '2023-08',
                      endDate: '2025-05',
                    },
                    {
                      '@type': 'CollegeOrUniversity',
                      name: 'University of Mumbai',
                      degree: 'Bachelor of Technology in Information Technology',
                      startDate: '2019-08',
                      endDate: '2023-05',
                    },
                  ],
                  knowsAbout: [
                    'React', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Swift',
                    'Node.js', 'Next.js', 'Angular', 'Django', 'FastAPI', 'Flask',
                    'PostgreSQL', 'MongoDB', 'Redis',
                    'AWS', 'GCP', 'Docker', 'Terraform',
                    'Machine Learning', 'AI', 'RAG Systems', 'LangChain', 'PyTorch', 'TensorFlow',
                    'REST APIs', 'Microservices', 'CI/CD',
                  ],
                  hasCredential: [
                    {
                      '@type': 'EducationalOccupationalCredential',
                      name: 'MS Computer Science',
                      credentialCategory: 'degree',
                      recognizedBy: { '@type': 'Organization', name: 'University of Southern California' },
                    },
                  ],
                  worksFor: {
                    '@type': 'Organization',
                    name: 'Open to Opportunities',
                  },
                  hasOccupation: {
                    '@type': 'Occupation',
                    name: 'Software Engineer',
                    skills: 'React, TypeScript, Python, Node.js, AI/ML, Cloud Computing',
                  },
                  sameAs: [
                    'https://linkedin.com/in/rutwikpatel13',
                    'https://github.com/RutwikPatel13',
                    'https://github.com/RutwikPatel03',
                  ],
                  memberOf: [
                    {
                      '@type': 'OrganizationRole',
                      memberOf: { '@type': 'Organization', name: 'Sigma Computing' },
                      roleName: 'Software Engineer Intern',
                      startDate: '2024-09',
                      endDate: '2024-12',
                      description: 'Built Conditional Formatting for Containers and Custom Page Headers features used by 60+ enterprise organizations.',
                    },
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://rutwik.dev/#website',
                  url: 'https://rutwik.dev',
                  name: 'Rutwik Patel - Software Engineer Portfolio',
                  description: 'Portfolio website of Rutwik Patel, Software Engineer',
                  author: { '@id': 'https://rutwik.dev/#person' },
                },
                {
                  '@type': 'ItemList',
                  name: 'Notable Achievements',
                  itemListElement: [
                    {
                      '@type': 'ListItem',
                      position: 1,
                      name: 'Conditional Formatting for Containers at Sigma Computing',
                      description: 'Built feature from scratch enabling dynamic styling based on formula conditions, now used by 60+ enterprise organizations',
                      url: 'https://help.sigmacomputing.com/docs/use-containers-to-organize-workbook-layouts',
                    },
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: 'Custom Page Headers at Sigma Computing',
                      description: 'Implemented end-to-end feature allowing users to add branded headers to workbooks',
                      url: 'https://help.sigmacomputing.com/docs/add-custom-page-headers-to-a-workbook',
                    },
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: 'Published IEEE Research Papers',
                      description: 'Published research on Explainable AI for Cataract Detection and Federated Learning',
                    },
                  ],
                },
              ],
            }),
          }}
        />
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


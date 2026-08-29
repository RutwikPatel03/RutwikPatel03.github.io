import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import { MotionConfig } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SmoothScrollProvider from '@/providers/SmoothScrollProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import CommandPaletteProvider from '@/providers/CommandPaletteProvider';
import CommandPalette from '@/components/ui/CommandPalette';
import SiteAnalytics from '@/components/analytics/SiteAnalytics';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // Removed 300 - rarely used, saves ~12KB
  variable: '--font-poppins',
  display: 'swap', // Prevent FOIT
  preload: true,
});

export const metadata: Metadata = {
  title: 'Rutwik Patel | Software & Infrastructure Engineer | USC CS',
  description: 'Software & Infrastructure Engineer. Shipped 4 production features at Sigma Computing used by 60+ enterprises. Built miniredis — a Redis-compatible store in C++ reaching 984K+ ops/sec. USC MS Computer Science. Published IEEE researcher. Backend, systems, cloud infrastructure, and AI/ML: C++, Go, TypeScript, Python, AWS, Kubernetes, Terraform, RAG. Seeking full-time SWE / Infra / Backend / AI roles.',
  keywords: [
    'Rutwik Patel',
    'Software Engineer',
    'Infrastructure Engineer',
    'Backend Engineer',
    'Systems Engineer',
    'Distributed Systems',
    'Full Stack Developer',
    'C++ Developer',
    'Go Developer',
    'React Developer',
    'TypeScript Expert',
    'Python Developer',
    'AI Engineer',
    'Machine Learning Engineer',
    'USC Computer Science',
    'Sigma Computing Engineer',
    'Cloud Infrastructure',
    'Kubernetes',
    'Terraform',
    'Published Researcher',
    'IEEE Published',
    'RAG Systems',
    'LangChain',
    'System Design',
    'Scalable Architecture',
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
    title: 'Rutwik Patel | Software & Infrastructure Engineer',
    description: 'Software Engineer building scalable systems & infrastructure. Shipped 4 features at Sigma Computing used by 60+ enterprises. Built miniredis (984K+ ops/sec). USC MS CS. Published IEEE researcher. Expert in Go, C++, TypeScript, Python, AI/ML.',
    url: 'https://rutwik.dev',
    siteName: 'Rutwik Patel - Software Engineer Portfolio',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://rutwik.dev/myimg/me.jpg',
        width: 1200,
        height: 1200,
        alt: 'Rutwik Patel - Software Engineer at Sigma Computing, USC MS Computer Science Graduate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rutwik Patel | Software & Infrastructure Engineer',
    description: 'Backend, systems & infra engineer. 4 features at Sigma Computing (60+ enterprises), built miniredis (984K+ ops/sec, C++), USC MS CS, IEEE published.',
    images: ['https://rutwik.dev/myimg/me.jpg'],
  },
  alternates: {
    canonical: 'https://rutwik.dev',
    languages: {
      'en-US': 'https://rutwik.dev',
      'x-default': 'https://rutwik.dev',
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/myimg/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* iOS reads the manifest for standalone mode only from 16.4; this is
            what makes it open without Safari's chrome on anything older. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Radio" />

        {/* Note: next/font self-hosts Google Fonts, so no font-origin preconnect
            is needed. Apollo loads afterInteractive, so a preconnect to it
            expires unused — both were removed per Lighthouse. */}

        {/* Search Engine Verification - Add your verification codes here */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" /> */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" /> */}

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
                  description: 'Software & Infrastructure Engineer with production impact at Sigma Computing, where he shipped 4 features now used by 60+ enterprise organizations. USC MS Computer Science graduate (3.81 GPA) and published IEEE researcher. Works across backend services, infrastructure, distributed systems, and applied AI — built miniredis, a Redis-compatible in-memory store in C++17 reaching 984K+ ops/sec. Expertise spans systems programming (C++, Go), full-stack development (React, TypeScript, Python), AI/ML (RAG, LangChain, PyTorch), and cloud infrastructure (AWS, GCP, Docker, Kubernetes, Terraform, CI/CD). Seeking full-time Software, Infrastructure, Backend, and AI Engineering roles.',
                  url: 'https://rutwik.dev',
                  image: 'https://rutwik.dev/myimg/me.jpg',
                  email: 'me.rutwik@gmail.com',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'San Francisco',
                    addressRegion: 'CA',
                    addressCountry: 'US',
                  },
                  alumniOf: [
                    {
                      '@type': 'CollegeOrUniversity',
                      name: 'University of Southern California',
                      department: 'Computer Science',
                      degree: 'Master of Science in Computer Science',
                      description: 'GPA: 3.8/4.0 - Top engineering program',
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
                    'React', 'TypeScript', 'JavaScript', 'Python', 'Go', 'C++',
                    'Node.js', 'Next.js', 'Angular', 'Django', 'FastAPI', 'Flask',
                    'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Skip List',
                    'AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
                    'Machine Learning', 'AI', 'RAG Systems', 'LangChain', 'PyTorch', 'TensorFlow',
                    'REST APIs', 'GraphQL', 'Microservices', 'CI/CD', 'System Design',
                    'Systems Programming', 'Event-Driven Architecture', 'Distributed Systems', 'Infrastructure',
                    'Agile', 'Scrum', 'Technical Leadership', 'Code Review',
                  ],
                  hasCredential: [
                    {
                      '@type': 'EducationalOccupationalCredential',
                      name: 'MS Computer Science - USC (3.8 GPA)',
                      credentialCategory: 'degree',
                      recognizedBy: { '@type': 'Organization', name: 'University of Southern California' },
                    },
                    {
                      '@type': 'EducationalOccupationalCredential',
                      name: 'IEEE Published Researcher',
                      credentialCategory: 'certification',
                      description: '2 peer-reviewed publications on AI/ML',
                    },
                  ],
                  worksFor: {
                    '@type': 'Organization',
                    name: 'Actively Seeking Full-Time Opportunities',
                  },
                  hasOccupation: {
                    '@type': 'Occupation',
                    name: 'Software Engineer',
                    skills: 'React, TypeScript, Python, Go, C++, Node.js, AI/ML, Cloud Infrastructure, Distributed Systems, System Design',
                    experienceRequirements: '2+ years of production experience',
                    qualifications: 'MS Computer Science, Published Researcher, Production Feature Ownership',
                  },
                  sameAs: [
                    'https://linkedin.com/in/rutwikpatel13',
                    'https://github.com/RutwikPatel13',
                    'https://github.com/RutwikPatel03',
                  ],
                  memberOf: [
                    {
                      '@type': 'OrganizationRole',
                      memberOf: { '@type': 'Organization', name: 'Sigma Computing', description: 'Series D startup valued at $1B+' },
                      roleName: 'Software Engineer Intern',
                      startDate: '2025-09',
                      endDate: '2025-12',
                      description: 'Delivered 4 production features end-to-end (condition-based formula visualization, Form v2, headers, navigation) now used by 60+ enterprise organizations. Optimized large data-grid rendering with memoization and virtualization; wrote Cypress end-to-end tests.',
                    },
                    {
                      '@type': 'OrganizationRole',
                      memberOf: { '@type': 'Organization', name: 'World Salon' },
                      roleName: 'Software Engineer',
                      startDate: '2024-07',
                      endDate: '2025-08',
                      description: 'Launched an events platform powering 130+ events. Engineered scraping and OpenAI-powered profiling pipelines processing 58,000+ candidate profiles end-to-end. Designed REST APIs with JWT auth and RBAC; refactored a monolith into modular payment and event services (−20% latency); deployed on AWS with Docker, EC2, S3, and GitHub Actions. Delivered production sites world-salon.com and b2b.world-salon.com.',
                    },
                    {
                      '@type': 'OrganizationRole',
                      memberOf: { '@type': 'Organization', name: 'USC Marshall School of Business' },
                      roleName: 'Research Assistant',
                      startDate: '2026-01',
                      endDate: '2026-05',
                      description: 'Built a RAG-based semantic search and chat platform over 10K+ vector embeddings, letting 30+ researchers query 500GB+ of sustainability disclosures in natural language. Developed schema-guided LLM extraction pipelines with citation grounding and a feedback loop; cut 15+ hours per week of manual review.',
                    },
                    {
                      '@type': 'OrganizationRole',
                      memberOf: { '@type': 'Organization', name: 'USC Marshall School of Business' },
                      roleName: 'Research Assistant',
                      startDate: '2024-02',
                      endDate: '2025-05',
                      description: 'Engineered RAG system with 10K+ vector embeddings across 500GB+ data. Built automated pipeline processing 15K+ PDFs with 30% faster extraction.',
                    },
                  ],
                  award: [
                    'Shipped 4 production features at Sigma Computing',
                    '60+ enterprise organizations using built features',
                    'Built miniredis — a Redis-compatible store in C++ reaching 984K+ ops/sec',
                    '2 IEEE published research papers',
                    'Processed 58,000+ candidate profiles end-to-end at World Salon',
                    '20% latency improvement through architecture optimization',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://rutwik.dev/#website',
                  url: 'https://rutwik.dev',
                  name: 'Rutwik Patel - Top Software Engineer Portfolio',
                  description: 'Portfolio of Rutwik Patel - High-impact Software Engineer with production experience at Sigma Computing. Strong hire recommendation for SWE roles.',
                  author: { '@id': 'https://rutwik.dev/#person' },
                },
                {
                  '@type': 'ItemList',
                  name: 'Key Achievements & Impact Metrics',
                  description: 'Quantifiable achievements demonstrating high-impact engineering capability',
                  itemListElement: [
                    {
                      '@type': 'ListItem',
                      position: 1,
                      name: 'Conditional Formatting for Containers - Sigma Computing',
                      description: 'SHIPPED TO PRODUCTION: Built feature from scratch enabling dynamic styling based on formula conditions. Now used by 60+ enterprise organizations including Fortune 500 companies. Demonstrates ability to own complex features end-to-end.',
                      url: 'https://help.sigmacomputing.com/docs/use-containers-to-organize-workbook-layouts',
                    },
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: 'Custom Page Headers - Sigma Computing',
                      description: 'SHIPPED TO PRODUCTION: Implemented end-to-end feature allowing users to add branded headers to workbooks for professional reporting. Full ownership from design to deployment.',
                      url: 'https://help.sigmacomputing.com/docs/add-custom-page-headers-to-a-workbook',
                    },
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: 'World Salon Platform - Full-Stack Development',
                      description: 'Built production websites serving real users: world-salon.com (main platform) and b2b.world-salon.com (enterprise platform). Processed 39,000+ profiles with automated workflows.',
                      url: 'https://www.world-salon.com',
                    },
                    {
                      '@type': 'ListItem',
                      position: 4,
                      name: 'IEEE Published Research',
                      description: 'Published 2 peer-reviewed papers: Explainable AI for Cataract Detection and Federated Learning for Healthcare. Demonstrates research capability and technical depth.',
                    },
                    {
                      '@type': 'ListItem',
                      position: 5,
                      name: 'RAG System Engineering - USC Research',
                      description: 'Engineered RAG system with 10K+ vector embeddings enabling semantic search across 500GB+ data. Built automated pipeline processing 15K+ PDFs with 30% faster extraction.',
                    },
                    {
                      '@type': 'ListItem',
                      position: 6,
                      name: 'miniredis — Redis-Compatible In-Memory Store',
                      description: 'Built a Redis-compatible in-memory store from scratch in C++17: non-blocking epoll/kqueue reactor over the RESP protocol, hand-written skip-list sorted sets, reaching 984K+ ops/sec (2.5x throughput via sharded locking). Load-tested with a Go benchmark harness.',
                      url: 'https://github.com/RutwikPatel13/miniredis',
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <CommandPaletteProvider>
              <SmoothScrollProvider>
                {children}
              </SmoothScrollProvider>
              <CommandPalette />
            </CommandPaletteProvider>
          </ThemeProvider>
        </MotionConfig>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />

        {/* First-party behavioural analytics (see /admin/analytics) */}
        <SiteAnalytics />

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


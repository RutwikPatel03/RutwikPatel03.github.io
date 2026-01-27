import type { Metadata } from 'next';
import AIPageClient from './AIPageClient';

export const metadata: Metadata = {
  title: 'AI Chat Assistant | Ask About Rutwik Patel | Software Engineer',
  description:
    "Chat with Rutwik Patel's AI assistant to learn about his software engineering experience at Sigma Computing, projects, skills in React, TypeScript, Python, AI/ML, and USC Computer Science background. Get instant answers about his qualifications.",
  keywords: [
    'Rutwik Patel AI',
    'Software Engineer Chat',
    'AI Assistant',
    'Portfolio Chat',
    'Ask AI',
    'Rutwik Patel Experience',
    'Sigma Computing Engineer',
    'USC Computer Science',
    'React Developer',
    'TypeScript Expert',
    'Python Developer',
    'AI Engineer',
  ],
  openGraph: {
    title: 'Chat with AI About Rutwik Patel | Software Engineer',
    description:
      'Ask AI anything about Rutwik Patel - his experience at Sigma Computing, projects, skills, and qualifications. Get instant, accurate answers.',
    url: 'https://rutwik.dev/ai',
    siteName: 'Rutwik Patel - Software Engineer Portfolio',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://rutwik.dev/myimg/me.jpg',
        width: 1200,
        height: 1200,
        alt: 'Rutwik Patel AI Chat Assistant - Software Engineer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat with AI About Rutwik Patel | Software Engineer',
    description:
      'Ask AI anything about Rutwik - Sigma Computing experience, USC MS CS, React/TypeScript/Python skills, and more.',
    images: ['https://rutwik.dev/myimg/me.jpg'],
  },
  alternates: {
    canonical: 'https://rutwik.dev/ai',
    languages: {
      'en-US': 'https://rutwik.dev/ai',
      'x-default': 'https://rutwik.dev/ai',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data for AI Chat Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Rutwik Patel AI Chat Assistant',
  description:
    "Interactive AI assistant that answers questions about Rutwik Patel's software engineering experience, skills, and qualifications.",
  url: 'https://rutwik.dev/ai',
  applicationCategory: 'ChatApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Rutwik Patel',
    url: 'https://rutwik.dev',
    jobTitle: 'Software Engineer',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Southern California',
    },
  },
  featureList: [
    'Ask about work experience at Sigma Computing',
    'Learn about technical skills (React, TypeScript, Python, Go)',
    'Explore projects and publications',
    'Get information about education and qualifications',
    'Instant AI-powered responses',
  ],
};

export default function AIPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AIPageClient />
    </>
  );
}


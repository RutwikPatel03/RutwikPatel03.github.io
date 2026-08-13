import { MetadataRoute } from 'next';
import { stations } from '@/data/radio';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rutwik.dev';
  const lastModified = new Date();

  // One entry per station so each rotation can rank on its own terms
  // (garba, 90s hindi, desi hip-hop) rather than competing on one URL.
  const radioRoutes: MetadataRoute.Sitemap = stations.map((station) => ({
    url:
      station.id === 'saloon'
        ? `${baseUrl}/radio`
        : `${baseUrl}/radio?station=${station.id}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...radioRoutes,
    // Main pages
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Section anchors for better indexing
    {
      url: `${baseUrl}/#about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#experience`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#projects`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#publications`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Resume PDF
    {
      url: `${baseUrl}/resume.pdf`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}


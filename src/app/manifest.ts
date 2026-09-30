import type { MetadataRoute } from 'next';

// The portfolio's own manifest.
//
// This used to describe the radio — name "Rutwik Radio", start_url /radio —
// because that was the only part of the site anyone would keep on a home
// screen, and one origin only gets one manifest. The radio now lives at
// music.rutwik.dev with a manifest of its own, so this one can finally be
// about the site it actually belongs to.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rutwik Patel | Software & Infrastructure Engineer',
    short_name: 'Rutwik Patel',
    description:
      'Portfolio of Rutwik Patel: software and infrastructure engineering, backend and distributed systems, and published AI/ML research.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

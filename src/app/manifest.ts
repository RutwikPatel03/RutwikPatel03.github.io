import type { MetadataRoute } from 'next';

// Makes the site installable, which matters for the radio specifically: added
// to an iPhone's home screen it opens without Safari's chrome and behaves like
// an app rather than a page.
//
// A manifest cannot grant background audio — the spec has no member for it —
// so this is about how the thing looks and launches, not what it may do while
// the screen is off.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rutwik Radio',
    short_name: 'Radio',
    description: 'An always-on Indian street-corner radio: 90s Hindi, garba, late-night melodies and Indian hip-hop.',
    // Opens on the radio rather than the portfolio, since that is the only
    // part of the site anyone would keep on a home screen.
    start_url: '/radio',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // The playlist station's shade, so the splash matches where it lands.
    background_color: '#191026',
    theme_color: '#191026',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

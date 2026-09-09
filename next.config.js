/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next.js Image Optimization for better Core Web Vitals
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
      },
    ],
  },
  // Optimize module imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['motion/react', 'lucide-react'],
  },
  // The radio moved to music.rutwik.dev. Every /radio link ever shared — and
  // the ?station= deep links in particular — has to keep working, so these
  // forward the path and Next carries the query string across automatically.
  //
  // 307 rather than 308 on purpose: a permanent redirect is cached hard by
  // browsers and is painful to walk back. Promote it to permanent: true once
  // the new domain has been up long enough to trust.
  async redirects() {
    return [
      {
        source: '/radio',
        destination: 'https://music.rutwik.dev',
        permanent: false,
      },
      {
        source: '/radio/:path*',
        destination: 'https://music.rutwik.dev/:path*',
        permanent: false,
      },
    ];
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/myimg/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


// ===========================================
// Site Configuration
// ===========================================

export const siteConfig = {
  name: 'Rutwik Patel',
  title: 'Rutwik Patel | Software & Infrastructure Engineer | USC CS',
  description:
    'Software & Infrastructure Engineer. Shipped 4 production features at Sigma Computing used by 60+ enterprises. Built miniredis — a Redis-compatible in-memory store in C++ reaching 984K+ ops/sec. USC MS Computer Science. Published IEEE researcher. Backend, systems, cloud infrastructure, and AI/ML expertise: C++, Go, TypeScript, Python, AWS, Kubernetes, Terraform, RAG. Seeking full-time SWE / Infra / Backend / AI Engineering roles.',
  url: 'https://rutwik.dev',
  ogImage: 'https://rutwik.dev/myimg/me.jpg',
  favicon: '/myimg/favicon.png',
  logo: 'RP',
  author: {
    name: 'Rutwik Patel',
    email: 'me.rutwik@gmail.com',
    location: 'San Francisco, CA',
  },
} as const;

// ===========================================
// Social Links
// ===========================================

export const socialLinks = {
  linkedin: 'https://www.linkedin.com/in/rutwikpatel13',
  github: 'https://github.com/RutwikPatel13',
  githubAlt: 'https://github.com/RutwikPatel03',
} as const;

// ===========================================
// Contact Information
// ===========================================

export const contactInfo = [
  {
    type: 'email' as const,
    label: 'Email',
    value: siteConfig.author.email,
    href: `mailto:${siteConfig.author.email}`,
  },
  {
    type: 'location' as const,
    label: 'Location',
    value: siteConfig.author.location,
    href: null,
  },
] as const;


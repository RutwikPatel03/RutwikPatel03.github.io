// ===========================================
// Site Configuration
// ===========================================

export const siteConfig = {
  name: 'Rutwik Patel',
  title: 'Rutwik Patel | Software Engineer | USC CS Graduate | Top Candidate',
  description:
    'High-impact Software Engineer with production experience at Sigma Computing (Series D, $1B+ valuation). Shipped 4 production features to 60+ enterprise customers. USC MS Computer Science (3.8 GPA). Published IEEE researcher. Full-stack expertise: React, TypeScript, Python, Go, AI/ML. Proven track record of delivering scalable solutions. Seeking Senior SWE / AI Engineer roles.',
  url: 'https://rutwik.dev',
  ogImage: 'https://rutwik.dev/myimg/me.jpg',
  favicon: '/myimg/favicon.png',
  logo: 'RP',
  author: {
    name: 'Rutwik Patel',
    email: 'rutwikpatel1313@gmail.com',
    phone: '+1 213-913-8803',
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
    type: 'phone' as const,
    label: 'Phone',
    value: siteConfig.author.phone,
    href: `tel:${siteConfig.author.phone.replace(/\s|-/g, '')}`,
  },
  {
    type: 'location' as const,
    label: 'Location',
    value: siteConfig.author.location,
    href: null,
  },
] as const;


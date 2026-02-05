// ===========================================
// Navigation Configuration
// ===========================================

export interface NavItem {
  name: string;
  href: string;
}

export const navItems: NavItem[] = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Publications', href: '#publications' },
  { name: 'Contact', href: '#contact' },
] as const;

// ===========================================
// External Links
// ===========================================

export const externalLinks = {
  resume: '/resume.pdf',
  aiChat: '/ai',
} as const;


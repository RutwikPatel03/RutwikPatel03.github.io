'use client';

import Link from 'next/link';
import { Linkedin, Github, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/rutwikpatel13' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/RutwikPatel13' },
  { icon: Mail, label: 'Email', href: 'mailto:me.rutwik@gmail.com' },
];

const navLinks = [
  { name: 'About', href: '/#about' },
  { name: 'Experience', href: '/#experience' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Publications', href: '/#publications' },
  { name: 'Blog', href: '/blog' },
  { name: 'Ask my AI', href: '/ai' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="font-display text-lg font-extrabold tracking-[-0.02em] text-paper">
            rutwik.dev
          </Link>
          <p className="font-mono text-xs tracking-[0.08em] text-[#A8A296]">
            © {currentYear} RUTWIK PATEL · FOCUSED ON IMPACT, NOT JUST CODE
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-[15px] text-[#CFC9BD] transition-colors hover:text-gold">
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#CFC9BD] transition-colors hover:border-gold hover:text-gold"
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { Linkedin, Github, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/rutwikpatel13' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/RutwikPatel13' },
  { icon: Mail, label: 'Email', href: 'mailto:rutwikpatel1313@gmail.com' },
];

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#projects' },
  { name: 'Publications', href: '#publications' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand - full width on mobile */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="font-heading text-lg sm:text-xl font-semibold text-foreground">
              Rutwik Patel
            </Link>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Focused on impact, not just code.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Connect</h4>
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            © {currentYear} Rutwik Patel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


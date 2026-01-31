'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X, Download, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { VisitorStats } from '@/components/ui/VisitorStats';
import { navItems, externalLinks, siteConfig } from '@/constants';
import { useScrollToSection, useScrolled } from '@/hooks';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled(50);
  const scrollToSection = useScrollToSection();
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to width percentage
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    scrollToSection(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border'
          : isMenuOpen
            ? 'bg-background backdrop-blur-lg border-b border-border'
            : 'bg-transparent'
      )}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        style={{ width: progressWidth }}
      />

      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">{siteConfig.logo}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <VisitorStats variant="minimal" />
            <div className="w-px h-4 bg-border" />
            <ThemeToggle />
            <Link
              href={externalLinks.aiChat}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI
            </Link>
            <Link
              href={externalLinks.resume}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Resume
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-background backdrop-blur-lg border-b border-border shadow-lg"
          >
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="px-4 py-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex items-center justify-between mt-4 px-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex gap-2 mt-4 px-4">
                <Link
                  href={externalLinks.aiChat}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </Link>
                <Link
                  href={externalLinks.resume}
                  target="_blank"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Resume
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}


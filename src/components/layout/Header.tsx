'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X, Download, MessageCircle, Search } from 'lucide-react';
// TEMPORARILY HIDDEN (2026-10-06): the theme toggle is off while the site uses
// the ID badge design (see PINNED_THEME in ThemeProvider). Restore the import
// and the two <ThemeToggle /> spots below.
// import ThemeToggle from '@/components/ui/ThemeToggle';
import { VisitorStats } from '@/components/ui/VisitorStats';
import { navItems, externalLinks } from '@/constants';
import { useScrollToSection, useScrolled } from '@/hooks';
import { useCommandPalette } from '@/providers/CommandPaletteProvider';
import { useSmoothScrollControls } from '@/providers/SmoothScrollProvider';
import { track } from '@/lib/analytics-client';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled(50);
  const scrollToSection = useScrollToSection();
  const { toggle: togglePalette } = useCommandPalette();
  const { stop: stopScroll, start: startScroll } = useSmoothScrollControls();
  const router = useRouter();
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to width percentage
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // The menu is a panel over the page, not a layer the page slides behind:
  // without this, a drag anywhere outside it scrolls the content underneath and
  // leaves the menu floating over whatever ended up there. Both halves are
  // needed — pausing Lenis alone leaves native scrolling on the routes where it
  // is not running, and hidden overflow alone does not stop Lenis, which
  // scrolls from script and so is not subject to it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    stopScroll();
    return () => {
      root.style.overflow = previous;
      startScroll();
    };
  }, [isMenuOpen, stopScroll, startScroll]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      scrollToSection(href);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || isMenuOpen
          ? 'bg-paper/90 backdrop-blur-lg border-b border-line'
          : 'bg-transparent'
      )}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px] bg-cardinal"
        style={{ width: progressWidth }}
      />

      <nav className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Wordmark */}
          <Link
            href="/"
            className="-ml-2 flex min-h-11 flex-col justify-center px-2 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <span className="font-display text-[17px] font-extrabold leading-none tracking-[-0.02em] text-ink">
              rutwik.dev
            </span>
            <span className="mt-1 font-mono text-[11px] leading-none tracking-[0.12em] text-taupe">ALL ACCESS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-line bg-white p-[5px]">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="rounded-full px-4 py-2.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons. Search and Resume only fit beside the nav
              from xl up; below that they are in the menu and the palette. */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={togglePalette}
              className="hidden xl:flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-taupe transition-colors hover:border-ink hover:text-ink"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="rounded bg-paper-deep px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            <span className="hidden xl:inline-flex">
              <VisitorStats variant="minimal" />
            </span>
            {/* <ThemeToggle /> */}
            <a
              href={externalLinks.resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('resume_download', 'header')}
              className="hidden xl:flex items-center gap-2 rounded-full border-[1.5px] border-ink px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <Download className="h-4 w-4" />
              Resume
            </a>
            <Link
              href={externalLinks.aiChat}
              className="flex items-center gap-2 rounded-full bg-cardinal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cardinal-deep"
            >
              Ask my AI
              <MessageCircle className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-[14px] border border-line bg-white text-ink"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-[72px] left-0 right-0 border-b border-line bg-paper shadow-lg"
          >
            <div className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="rounded-xl px-4 py-3 text-left font-display text-lg font-semibold text-ink transition-colors hover:bg-paper-deep"
                >
                  {item.name}
                </button>
              ))}
              {/* The palette's only other trigger is the desktop Search button
                  and Cmd-K, so without this it is unreachable on a phone. */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  togglePalette();
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-taupe transition-colors hover:bg-paper-deep hover:text-ink"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              {/* TEMPORARILY HIDDEN (2026-10-06): theme row, see the import above.
              <div className="flex items-center justify-between mt-4 px-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div> */}
              <div className="mt-3 flex gap-2 border-t border-line px-1 pt-4">
                <Link
                  href={externalLinks.aiChat}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cardinal px-4 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask my AI
                </Link>
                <a
                  href={externalLinks.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    track('resume_download', 'mobile_menu');
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink px-4 py-3 text-sm font-medium text-ink"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}

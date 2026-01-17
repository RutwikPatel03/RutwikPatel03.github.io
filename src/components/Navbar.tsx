'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PageType } from '@/types';

interface NavbarProps {
  activePage?: PageType;
  onPageChange?: (page: PageType) => void;
}

const navItems: { label: string; page: PageType }[] = [
  { label: 'About', page: 'About' },
  { label: 'Background', page: 'ExperienceEducation' },
  { label: 'Projects', page: 'Portfolio' },
  { label: 'Publication', page: 'Publication' },
  { label: 'Blog', page: 'Blog' },
  { label: 'Contact', page: 'Contact' },
];

export default function Navbar({ activePage, onPageChange }: NavbarProps) {
  const pathname = usePathname();
  const isAIPage = pathname === '/ai';

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {navItems.map(({ label, page }) => (
          <li key={page} className="navbar-item">
            {onPageChange ? (
              <button
                className={`navbar-link ${activePage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {label}
              </button>
            ) : (
              <Link href="/" className="navbar-link">
                {label}
              </Link>
            )}
          </li>
        ))}
        <li className="navbar-item">
          <Link
            href="/ai"
            className={`navbar-link ai-link ${isAIPage ? 'active' : ''}`}
          >
            <span className="ai-icon">✨</span>
            AI Chat
          </Link>
        </li>
      </ul>
    </nav>
  );
}


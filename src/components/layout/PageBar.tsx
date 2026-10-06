import Link from 'next/link';
import { cn } from '@/lib/utils';

const LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Blog', href: '/blog' },
  { name: 'Ask my AI', href: '/ai' },
] as const;

type Section = (typeof LINKS)[number]['name'];

/**
 * The top bar on pages other than home. The home header scrolls to sections
 * on the same page, so these are plain links instead.
 */
export default function PageBar({ current }: { current?: Section }) {
  return (
    <header className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link href="/" aria-label="Home" className="flex min-h-11 flex-col justify-center">
        <span className="font-display text-[17px] font-extrabold leading-none tracking-[-0.02em] text-ink">rutwik.dev</span>
        <span className="mt-1 font-mono text-[11px] leading-none tracking-[0.12em] text-taupe">ALL ACCESS</span>
      </Link>
      <nav aria-label="Site" className="flex flex-wrap gap-1 rounded-full border border-line bg-white p-[5px]">
        {LINKS.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            aria-current={current === link.name ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-2.5 text-sm transition-colors',
              current === link.name ? 'bg-ink font-semibold text-paper' : 'text-ink hover:bg-paper-deep'
            )}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

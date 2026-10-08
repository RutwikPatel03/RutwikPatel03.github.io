'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  /** Set after the title in italic serif, e.g. "Access" + "passes." */
  accent?: string;
  /** Small mono label above the title, e.g. "03 Projects". */
  eyebrow?: string;
  subtitle?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
  /** "ink" for headers on the black sections. */
  tone?: 'paper' | 'ink';
  /** Heading level. Pages use h1, sections h2. */
  as?: 'h1' | 'h2';
}

export function SectionHeader({
  title,
  accent,
  eyebrow,
  subtitle,
  className,
  align = 'left',
  tone = 'paper',
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const onInk = tone === 'ink';

  return (
    <motion.div
      // A page title (h1) is there on arrival, so it skips the fade-in: the
      // fade starts at opacity 0 in the server HTML, leaving the title hidden
      // until scripts run.
      initial={Heading === 'h1' ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'mb-10 flex flex-wrap items-end gap-6',
        align === 'center' ? 'flex-col items-center text-center' : 'justify-between',
        className
      )}
    >
      <div className="flex flex-col gap-5">
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2.5 font-mono text-[13px] uppercase tracking-[0.12em]',
              align === 'center' && 'justify-center',
              onInk ? 'text-gold' : 'text-taupe'
            )}
          >
            <span aria-hidden="true" className={cn('h-3.5 w-[22px] rounded-[3px]', onInk ? 'bg-gold' : 'bg-cardinal')} />
            {eyebrow}
          </span>
        )}
        <Heading
          className={cn(
            'font-display text-[clamp(44px,6vw,96px)] font-extrabold leading-[0.9] tracking-[-0.05em]',
            onInk ? 'text-paper' : 'text-ink'
          )}
        >
          {title}
          {accent && (
            <>
              {' '}
              <span className={cn('font-serif font-normal italic tracking-[-0.02em]', onInk ? 'text-gold' : 'text-cardinal')}>
                {accent}
              </span>
            </>
          )}
        </Heading>
      </div>
      {subtitle && (
        <p className={cn('max-w-[420px] text-lg leading-relaxed', onInk ? 'text-[#CFC9BD]' : 'text-[#2C2925]')}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default SectionHeader;

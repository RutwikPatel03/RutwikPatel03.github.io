'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SectionHeader({
  title,
  subtitle,
  className,
  align = 'center',
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(alignmentClasses[align], 'mb-16', className)}
    >
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-4 text-muted-foreground max-w-2xl',
          align === 'center' && 'mx-auto'
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default SectionHeader;


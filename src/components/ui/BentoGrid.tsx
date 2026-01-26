'use client';

import { ReactNode, useState, useRef, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const colSpanClasses = {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
  };

  const rowSpanClasses = {
    1: '',
    2: 'row-span-2',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-muted/30 p-6 backdrop-blur-sm transition-colors hover:border-border/80',
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {/* Spotlight effect */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface BentoCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardHeader({ children, className }: BentoCardHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>{children}</div>
  );
}

interface BentoCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardTitle({ children, className }: BentoCardTitleProps) {
  return (
    <h3 className={cn('font-heading text-lg font-semibold text-foreground', className)}>
      {children}
    </h3>
  );
}

interface BentoCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardDescription({ children, className }: BentoCardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

interface BentoCardContentProps {
  children: ReactNode;
  className?: string;
}

export function BentoCardContent({ children, className }: BentoCardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}


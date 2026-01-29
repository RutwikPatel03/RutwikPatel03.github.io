'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  iconClassName?: string;
  successDuration?: number;
  label?: string;
}

export function CopyButton({
  text,
  className,
  iconClassName,
  successDuration = 2000,
  label = 'Copy',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text, successDuration]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
        'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        copied && 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500',
        className
      )}
      aria-label={copied ? 'Copied!' : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center gap-1.5"
          >
            <Check className={cn('w-4 h-4', iconClassName)} />
            <span>Copied!</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center gap-1.5"
          >
            <Copy className={cn('w-4 h-4', iconClassName)} />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}


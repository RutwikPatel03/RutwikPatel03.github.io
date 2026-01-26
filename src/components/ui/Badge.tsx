import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-muted text-muted-foreground',
        secondary:
          'bg-accent text-accent-foreground',
        outline:
          'border border-border text-foreground',
        success:
          'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        warning:
          'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        error:
          'bg-red-500/10 text-red-500 border border-red-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };


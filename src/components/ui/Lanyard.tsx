import { cn } from '@/lib/utils';

interface LanyardProps {
  /** Strap color. */
  color?: string;
  /** Strap length in px, above the clip. */
  length?: number;
  /** Optional text printed down the strap. */
  label?: string;
  labelColor?: string;
  className?: string;
}

/** A lanyard strap ending in a metal clip, for a badge to hang from. */
export function Lanyard({ color = '#C8102E', length = 120, label, labelColor = '#FFFFFF', className }: LanyardProps) {
  return (
    <div aria-hidden="true" className={cn('flex flex-col items-center', className)}>
      <div
        className="flex w-[22px] justify-center overflow-hidden shadow-[inset_-5px_0_0_rgba(0,0,0,0.12)]"
        style={{ height: length, backgroundColor: color, transition: 'height 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
        {label && (
          <span
            className="whitespace-nowrap pt-6 font-mono text-[10px] tracking-[0.32em] opacity-90 [writing-mode:vertical-rl]"
            style={{ color: labelColor }}
          >
            {label}
          </span>
        )}
      </div>
      <div className="-mt-[3px] h-[22px] w-[42px] rounded-[8px] border border-[#8C867B] bg-gradient-to-b from-[#ECE8DF] to-[#A29C91]" />
    </div>
  );
}

/** The slot at the top of a card that the lanyard clip goes through. */
export function PunchSlot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('flex h-6 items-center justify-center', className)}>
      <span className="punch-slot" />
    </span>
  );
}

export default Lanyard;

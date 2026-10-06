'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { publications } from '@/data/content';
import { siteConfig } from '@/constants';
import { cn } from '@/lib/utils';
import { Barcode } from './Barcode';
import { PunchSlot } from './Lanyard';

const ieeePapers = publications.filter((p) => p.publisher === 'IEEE').length;

interface Tilt {
  rx: number;
  ry: number;
  gx: number;
  gy: number;
}

const REST: Tilt = { rx: 0, ry: 0, gx: 30, gy: 20 };

interface IdBadgeProps {
  /** Smaller card for phones. */
  compact?: boolean;
  className?: string;
}

/**
 * The site's ID card. It leans toward a mouse pointer with a light glare, and
 * flips on click to a back with a QR code for the AI chat. Touch screens and
 * reduced motion get the flip without the tilt.
 */
export function IdBadge({ compact = false, className }: IdBadgeProps) {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState<Tilt>(REST);
  const [flipped, setFlipped] = useState(false);
  // The flip needs a slow transition and the tilt a fast one, so the slow one
  // is only on while a flip is running.
  const [flipping, setFlipping] = useState(false);
  const flipTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(flipTimer.current), []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({
      rx: Math.round(-y * 16),
      ry: Math.round(x * 20),
      gx: Math.round((x + 0.5) * 100),
      gy: Math.round((y + 0.5) * 100),
    });
  };

  const flip = () => {
    setFlipped((f) => !f);
    setFlipping(true);
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => setFlipping(false), 850);
  };

  const size = compact ? 'h-[392px] w-[270px]' : 'h-[540px] w-[360px]';

  return (
    <div
      className={cn('relative [perspective:1600px]', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt(REST)}
    >
      <button
        type="button"
        onClick={flip}
        aria-label={flipped ? 'Flip the ID badge to the front' : 'Flip the ID badge to the back'}
        className={cn('block text-left', size)}
      >
        <div
          className="relative h-full w-full [transform-style:preserve-3d]"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry + (flipped ? 180 : 0)}deg)`,
            transition: flipping
              ? 'transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)'
              : 'transform 0.18s ease-out',
          }}
        >
          {/* Front */}
          <div
            className={cn(
              'card-face flex flex-col overflow-hidden bg-white shadow-[0_50px_90px_rgba(16,16,18,0.28),0_0_0_1px_rgba(16,16,18,0.06)]',
              compact ? 'rounded-[22px]' : 'rounded-[28px]'
            )}
          >
            <PunchSlot />
            <div
              className={cn(
                'mx-3 flex items-center justify-between rounded-2xl bg-ink text-paper',
                compact ? 'px-3 py-2' : 'mx-4 px-4 py-3'
              )}
            >
              <span className={cn('font-display font-extrabold tracking-tight', compact ? 'text-base' : 'text-[21px]')}>
                ALL ACCESS
              </span>
              <span className="font-mono text-xs text-gold">{new Date().getFullYear()}</span>
            </div>
            <div className={cn('relative overflow-hidden rounded-2xl', compact ? 'mx-3 mt-2.5 h-[170px]' : 'mx-4 mt-3 h-[236px]')}>
              <Image
                src="/myimg/me.jpg"
                alt={`${siteConfig.name}, Software and Infrastructure Engineer`}
                fill
                priority
                sizes={compact ? '246px' : '328px'}
                className="object-cover object-[center_26%]"
              />
            </div>
            <div className={cn('flex flex-col gap-0.5', compact ? 'px-4 pt-3' : 'px-5 pt-3.5')}>
              <span className={cn('font-display font-extrabold leading-none tracking-[-0.035em]', compact ? 'text-[26px]' : 'text-[32px]')}>
                {siteConfig.name}
              </span>
              <span className="text-sm text-taupe">Software &amp; Infrastructure Engineer</span>
            </div>
            <dl className={cn('grid grid-cols-2 gap-x-3.5 gap-y-2', compact ? 'px-4 pt-2.5' : 'px-5 pt-3')}>
              <BadgeField label="BASE" value={siteConfig.author.location} />
              <BadgeField label="SCHOOL" value="USC, MS CS" />
              {!compact && <BadgeField label="FOCUS" value="Backend, infra, AI" />}
              {!compact && <BadgeField label="PUBLISHED" value={`${publications.length} papers, ${ieeePapers} IEEE`} />}
            </dl>
            <div className={cn('mt-auto flex items-stretch gap-2.5', compact ? 'px-3 pb-3' : 'px-4 pb-4')}>
              <span
                aria-hidden="true"
                className="flex flex-1 animate-foil items-center rounded-[10px] bg-foil bg-[length:200%_100%] px-3 font-mono text-[11px] tracking-[0.16em] text-[#3B3540]"
              >
                {!compact && 'RUTWIK.DEV'}
              </span>
              <Barcode value="rutwik.dev" height={compact ? 30 : 40} />
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 45%)`,
              }}
            />
          </div>

          {/* Back */}
          <div
            className={cn(
              'card-face card-face-back flex flex-col gap-4 overflow-hidden bg-cardinal px-5 pb-5 text-white shadow-[0_50px_90px_rgba(16,16,18,0.28)]',
              compact ? 'rounded-[22px]' : 'rounded-[28px]'
            )}
          >
            <PunchSlot />
            <span className="font-mono text-[11px] tracking-[0.16em] text-[#FFE6A3]">IF FOUND, PLEASE</span>
            <span className={cn('font-serif italic leading-[0.98]', compact ? 'text-[34px]' : 'text-[40px]')}>
              Ask my AI. It knows my work.
            </span>
            <span className={cn('self-center overflow-hidden rounded-2xl bg-white', compact ? 'h-[130px] w-[130px]' : 'h-[190px] w-[190px]')}>
              <Image
                src="/images/qr-ai.png"
                alt="QR code that opens rutwik.dev/ai"
                width={190}
                height={190}
                unoptimized
                className="h-full w-full [image-rendering:pixelated]"
              />
            </span>
            <span className="text-center font-mono text-xs tracking-[0.1em]">rutwik.dev/ai</span>
            {!compact && (
              <dl className="mt-auto flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                  <dt className="text-[#FBE3E6]">Degree</dt>
                  <dd>MS CS, USC, 3.81</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                  <dt className="text-[#FBE3E6]">Badges held</dt>
                  <dd>Sigma, World Salon, USC Marshall</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

function BadgeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-px">
      <dt className="font-mono text-[10px] tracking-[0.1em] text-taupe">{label}</dt>
      <dd className="text-[13px] font-semibold">{value}</dd>
    </div>
  );
}

export default IdBadge;

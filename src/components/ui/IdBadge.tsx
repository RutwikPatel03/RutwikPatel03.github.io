'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { publications } from '@/data/content';
import { siteConfig } from '@/constants';
import { useCurrentYear } from '@/hooks/useCurrentYear';
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

/**
 * The site's ID card. It leans toward a mouse pointer with a light glare, and
 * flips on click to a back with a QR code for the AI chat. Touch screens and
 * reduced motion get the flip without the tilt.
 *
 * One card that resizes at `sm`, rather than a phone copy and a desktop copy
 * with one hidden: hidden copies still preload their photo.
 */
export function IdBadge({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const year = useCurrentYear();
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
        className="block h-[392px] w-[270px] text-left sm:h-[540px] sm:w-[360px]"
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
          <div className="card-face flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_50px_90px_rgba(16,16,18,0.28),0_0_0_1px_rgba(16,16,18,0.06)] sm:rounded-[28px]">
            <PunchSlot />
            <div className="mx-3 flex items-center justify-between rounded-2xl bg-ink px-3 py-2 text-paper sm:mx-4 sm:px-4 sm:py-3">
              <span className="font-display text-base font-extrabold tracking-tight sm:text-[21px]">ALL ACCESS</span>
              <span className="font-mono text-xs text-gold">{year}</span>
            </div>
            <div className="relative mx-3 mt-2.5 h-[170px] overflow-hidden rounded-2xl sm:mx-4 sm:mt-3 sm:h-[236px]">
              <Image
                src="/myimg/me.jpg"
                alt={`${siteConfig.name}, Software and Infrastructure Engineer`}
                fill
                priority
                sizes="(min-width: 640px) 328px, 246px"
                className="object-cover object-[center_26%]"
              />
            </div>
            <div className="flex flex-col gap-0.5 px-4 pt-3 sm:px-5 sm:pt-3.5">
              <span className="font-display text-[26px] font-extrabold leading-none tracking-[-0.035em] sm:text-[32px]">
                {siteConfig.name}
              </span>
              <span className="text-sm text-taupe">Software &amp; Infrastructure Engineer</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3.5 gap-y-2 px-4 pt-2.5 sm:px-5 sm:pt-3">
              <BadgeField label="BASE" value={siteConfig.author.location} />
              <BadgeField label="SCHOOL" value="USC, MS CS" />
              <BadgeField label="FOCUS" value="Backend, infra, AI" className="hidden sm:flex" />
              <BadgeField
                label="PUBLISHED"
                value={`${publications.length} papers, ${ieeePapers} IEEE`}
                className="hidden sm:flex"
              />
            </dl>
            <div className="mt-auto flex items-stretch gap-2.5 px-3 pb-3 sm:px-4 sm:pb-4">
              <span
                aria-hidden="true"
                className="flex flex-1 animate-foil items-center rounded-[10px] bg-foil bg-[length:200%_100%] px-3 font-mono text-[11px] tracking-[0.16em] text-[#3B3540]"
              >
                <span className="hidden sm:inline">RUTWIK.DEV</span>
              </span>
              <Barcode value="rutwik.dev" height={30} className="sm:hidden" />
              <Barcode value="rutwik.dev" height={40} className="hidden sm:block" />
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
          <div className="card-face card-face-back flex flex-col gap-4 overflow-hidden rounded-[22px] bg-cardinal px-5 pb-5 text-white shadow-[0_50px_90px_rgba(16,16,18,0.28)] sm:rounded-[28px]">
            <PunchSlot />
            <span className="font-mono text-[11px] tracking-[0.16em] text-[#FFE6A3]">IF FOUND, PLEASE</span>
            <span className="font-serif text-[34px] italic leading-[0.98] sm:text-[40px]">Ask my AI. It knows my work.</span>
            <span className="h-[130px] w-[130px] self-center overflow-hidden rounded-2xl bg-white sm:h-[190px] sm:w-[190px]">
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
            <dl className="mt-auto hidden flex-col gap-1.5 text-[13px] sm:flex">
              <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                <dt className="text-[#FBE3E6]">Degree</dt>
                <dd>MS CS, USC, 3.81</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                <dt className="text-[#FBE3E6]">Badges held</dt>
                <dd>Sigma, World Salon, USC Marshall</dd>
              </div>
            </dl>
          </div>
        </div>
      </button>
    </div>
  );
}

function BadgeField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-px', className)}>
      <dt className="font-mono text-[10px] tracking-[0.1em] text-taupe">{label}</dt>
      <dd className="text-[13px] font-semibold">{value}</dd>
    </div>
  );
}

export default IdBadge;

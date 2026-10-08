'use client';

import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { Barcode } from '@/components/ui/Barcode';
import { PunchSlot } from '@/components/ui/Lanyard';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="bg-dots flex min-h-screen items-center bg-paper px-4 py-16 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-center gap-16">
        {/* A voided badge */}
        {/* Fluid up to 300px, so the tilted card fits a 320px phone. */}
        <div className="relative w-full max-w-[300px] shrink-0">
          <div className="flex h-[440px] w-full -rotate-[4deg] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_40px_80px_rgba(16,16,18,0.18)]">
            <PunchSlot />
            <div className="mx-3.5 flex items-center justify-between rounded-[14px] bg-ink px-3.5 py-3 text-paper">
              <span className="font-display text-xl font-extrabold">ERROR</span>
              <span className="font-mono text-xs text-gold">404</span>
            </div>
            <div className="mx-3.5 mt-3.5 flex h-[190px] items-center justify-center rounded-2xl bg-[repeating-linear-gradient(45deg,#EFEBE2_0_12px,#E6E1D5_12px_24px)]">
              <User className="h-20 w-20 text-[#A39B8C]" strokeWidth={1.4} />
            </div>
            <div className="flex flex-col gap-1 px-5 py-4">
              <span className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink">Unknown page</span>
              <span className="font-mono text-xs text-taupe">HOLDER NOT ON FILE</span>
            </div>
            <div className="mx-auto mb-5 mt-auto">
              <Barcode value="BADGE-NOT-FOUND" height={30} />
            </div>
          </div>
          <span
            aria-hidden="true"
            className="absolute left-[30px] top-[170px] -rotate-[18deg] rounded-[14px] border-[6px] border-cardinal bg-white/55 px-[22px] py-1.5 font-display text-[76px] font-extrabold leading-none tracking-[0.04em] text-cardinal"
          >
            VOID
          </span>
        </div>

        <div className="flex max-w-[520px] flex-[1_1_380px] flex-col gap-5">
          <span className="font-mono text-[13px] tracking-[0.12em] text-taupe">404 · PAGE NOT FOUND</span>
          <h1 className="font-display text-[clamp(52px,6vw,88px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
            Badge not{' '}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-cardinal">recognized.</span>
          </h1>
          <p className="text-[19px] leading-relaxed text-[#2C2925]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Your pass still works everywhere
            else on the site.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/"
              className="inline-flex h-[50px] items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-cardinal"
            >
              Back to home
            </Link>
            <button
              type="button"
              onClick={() => history.back()}
              className="inline-flex h-[50px] items-center gap-2 rounded-full border-[1.5px] border-ink px-6 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
            <Link
              href="/ai"
              className="inline-flex h-[50px] items-center rounded-full border-[1.5px] border-ink px-6 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Ask my AI
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

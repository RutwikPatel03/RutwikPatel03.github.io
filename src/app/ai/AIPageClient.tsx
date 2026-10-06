'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
// TEMPORARILY HIDDEN (2026-10-06): the theme toggle is off while the site uses
// the ID badge design (see PINNED_THEME in ThemeProvider).
// import ThemeToggle from '@/components/ui/ThemeToggle';
import { Lanyard, PunchSlot } from '@/components/ui/Lanyard';
import { useVisualViewport } from '@/hooks';
import { siteConfig } from '@/constants';
import type { PostMeta } from '@/lib/blog';

export default function AIPageClient({ posts }: { posts: PostMeta[] }) {
  const viewport = useVisualViewport();

  return (
    // Sized against the visual viewport rather than `inset-0`, so the composer
    // at the bottom stays above the on-screen keyboard instead of behind it.
    // 100dvh is the fallback before the first measurement and on browsers
    // without the API.
    <div
      className="fixed inset-x-0 top-0 flex bg-background"
      style={{
        height: viewport ? `${viewport.height}px` : '100dvh',
        transform: viewport ? `translateY(${viewport.offsetTop}px)` : undefined,
      }}
    >
      {/* The badge holder, on screens wide enough for it */}
      <aside className="hidden w-[380px] shrink-0 flex-col gap-7 overflow-y-auto bg-ink px-7 pb-8 pt-6 text-paper lg:flex">
        <Link href="/" className="flex min-h-11 flex-col justify-center self-start">
          <span className="font-display text-[17px] font-extrabold leading-none tracking-[-0.02em]">rutwik.dev</span>
          <span className="mt-1 font-mono text-[11px] leading-none tracking-[0.12em] text-[#A8A296]">ALL ACCESS</span>
        </Link>
        <div className="flex flex-col items-center">
          <Lanyard color="#C8102E" length={60} />
          <div className="mt-1 w-[250px] -rotate-2 overflow-hidden rounded-[22px] bg-white text-ink shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <PunchSlot className="h-5" />
            <div className="mx-3 flex items-center justify-between rounded-xl bg-cardinal px-3 py-2 text-white">
              <span className="font-display text-[15px] font-extrabold">AI ASSISTANT</span>
              <span className="h-2 w-2 animate-blink rounded-full bg-gold" />
            </div>
            <div className="flex items-center gap-3 p-3.5">
              <span className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-2xl">
                <Image src="/myimg/me.jpg" alt="" fill sizes="60px" className="object-cover object-[center_25%]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-display text-[19px] font-extrabold tracking-[-0.02em]">
                  {siteConfig.name.split(' ')[0]}&apos;s AI
                </span>
                <span className="text-xs text-taupe">Speaks for the badge holder</span>
              </span>
            </div>
          </div>
        </div>
        <p className="text-base leading-relaxed text-[#CFC9BD]">
          It answers from my portfolio: roles, projects, papers and blog posts, plus live GitHub activity, and shows
          role and project cards as it goes.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="z-50 h-14 w-full flex-shrink-0 border-b border-border bg-background">
          <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-3 sm:px-4">
            <Link
              href="/"
              aria-label="Back to portfolio"
              className="-ml-2 flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to rutwik.dev</span>
            </Link>
            <span className="hidden font-display text-lg font-extrabold tracking-[-0.02em] text-foreground sm:inline">
              Ask the <span className="font-serif font-normal italic text-cardinal">badge holder.</span>
            </span>
            {/* <ThemeToggle /> */}
          </div>
        </header>

        {/* Chat Interface */}
        <ChatInterface posts={posts} />
      </div>
    </div>
  );
}

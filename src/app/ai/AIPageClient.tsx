'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useVisualViewport } from '@/hooks';
import type { PostMeta } from '@/lib/blog';

export default function AIPageClient({ posts }: { posts: PostMeta[] }) {
  const viewport = useVisualViewport();

  return (
    // Sized against the visual viewport rather than `inset-0`, so the composer
    // at the bottom stays above the on-screen keyboard instead of behind it.
    // 100dvh is the fallback before the first measurement and on browsers
    // without the API.
    <div
      className="fixed inset-x-0 top-0 flex flex-col bg-background"
      style={{
        height: viewport ? `${viewport.height}px` : '100dvh',
        transform: viewport ? `translateY(${viewport.offsetTop}px)` : undefined,
      }}
    >
      {/* Header */}
      <header className="h-12 sm:h-14 flex-shrink-0 z-50 w-full border-b border-border bg-background font-mono">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to portfolio"
            className="-ml-2 flex min-h-11 items-center gap-1.5 px-2 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>cd ~/portfolio</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-foreground">
              <span className="text-[#D97757]" aria-hidden="true">✻ </span>
              rutwik-ai
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface posts={posts} />
    </div>
  );
}


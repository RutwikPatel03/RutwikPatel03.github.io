'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useVisualViewport } from '@/hooks';

export default function AIPageClient() {
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
      <header className="h-12 sm:h-14 flex-shrink-0 z-50 w-full border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            className="-ml-2 flex min-h-11 items-center gap-1.5 px-2 text-muted-foreground transition-colors hover:text-foreground sm:gap-2"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Back</span>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">&nbsp;to Portfolio</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="text-sm sm:text-base font-semibold text-foreground">Rutwik AI</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}


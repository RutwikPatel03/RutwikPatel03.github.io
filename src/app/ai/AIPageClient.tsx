'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AIPageClient() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <header className="h-12 sm:h-14 flex-shrink-0 z-50 w-full border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Back</span>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline"> to Portfolio</span>
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


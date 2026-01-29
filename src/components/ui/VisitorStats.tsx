'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Users, TrendingUp } from 'lucide-react';

interface VisitorStatsProps {
  className?: string;
  variant?: 'minimal' | 'detailed';
}

interface StatsResponse {
  count: number;
  isNewVisitor?: boolean;
  success: boolean;
}

// Global visitor counter using Upstash Redis via API
function useViewCounter() {
  const [views, setViews] = useState<number | null>(null);
  const [isNewVisitor, setIsNewVisitor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const SESSION_KEY = 'portfolio_counted';

    async function trackVisit() {
      try {
        // Check if we already counted this session
        const hasBeenCounted = sessionStorage.getItem(SESSION_KEY);

        if (!hasBeenCounted) {
          // First visit this session - POST to increment
          const response = await fetch('/api/stats', { method: 'POST' });
          const data: StatsResponse = await response.json();

          if (data.success) {
            setViews(data.count);
            setIsNewVisitor(data.isNewVisitor || false);
            sessionStorage.setItem(SESSION_KEY, 'true');
          }
        } else {
          // Already counted - just GET the current count
          const response = await fetch('/api/stats');
          const data: StatsResponse = await response.json();

          if (data.success) {
            setViews(data.count);
          }
        }
      } catch (error) {
        console.error('Failed to track visit:', error);
        // Fallback to showing nothing on error
        setViews(null);
      } finally {
        setIsLoading(false);
      }
    }

    trackVisit();
  }, []);

  return { views, isNewVisitor, isLoading };
}

export function VisitorStats({ className, variant = 'minimal' }: VisitorStatsProps) {
  const { views, isNewVisitor, isLoading } = useViewCounter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse rounded-full h-2 w-2 bg-muted-foreground/50"></span>
          </span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't show if views failed to load
  if (views === null) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={className}
      >
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>{views.toLocaleString()} visits</span>
          {isNewVisitor && (
            <span className="text-green-500 font-medium">• Welcome!</span>
          )}
        </div>
      </motion.div>
    );
  }

  // Detailed variant with more stats
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={className}
    >
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{views.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="relative flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online now
          </span>
        </div>
        {isNewVisitor && (
          <div className="flex items-center gap-2 text-green-500">
            <TrendingUp className="w-4 h-4" />
            <span>Welcome, new visitor!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}


'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the page has been scrolled past a threshold
 * @param threshold - The scroll threshold in pixels (default: 50)
 * @returns Whether the page has been scrolled past the threshold
 */
export function useScrolled(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}


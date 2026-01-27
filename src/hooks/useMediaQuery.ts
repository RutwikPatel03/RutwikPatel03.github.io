'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if a media query matches
 * @param query - The media query to check (e.g., '(min-width: 768px)')
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Common breakpoint hooks
export function useIsMobile(): boolean {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile;
}

export function useIsTablet(): boolean {
  const isTabletOrLarger = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isTabletOrLarger && !isDesktop;
}

export function useIsDesktop(): boolean {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop;
}


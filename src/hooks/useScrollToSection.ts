'use client';

import { useCallback } from 'react';

/**
 * Hook to scroll to a section on the page
 * @returns A function that scrolls to the given section
 */
export function useScrollToSection() {
  const scrollToSection = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return scrollToSection;
}


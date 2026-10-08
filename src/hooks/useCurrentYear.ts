'use client';

import { useEffect, useState } from 'react';

/**
 * The current year, filled in after mount, so null on the first render.
 *
 * Pages here are prerendered at build time. A year read during render is
 * baked into the HTML, goes stale on January 1st, and no longer matches what
 * the browser renders, which is a hydration error until the next deploy.
 */
export function useCurrentYear(): number | null {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
}

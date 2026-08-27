'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { flush, resetPageState, track, trackOnce } from '@/lib/analytics-client';

// Passive instrumentation: the two questions that need no click to answer.
//
// "What did they look at" is section visibility, and "how far did they get" is
// scroll depth. Both are read off the page rather than wired into components,
// so adding a section to the homepage instruments it automatically.

/** A section has to hold the viewport this long to count as read, not scrolled past. */
const DWELL_MS = 1000;

/**
 * A horizontal band across the middle of the viewport, expressed as a root
 * margin that shrinks the root to its central 20%.
 *
 * The obvious implementation — `threshold: 0.5` on the section itself — is
 * wrong for this page. A threshold is a fraction of the *element*, so an
 * element taller than the viewport can never satisfy it: Experience and
 * Projects run to several screens each and would silently never register a
 * view, losing exactly the sections worth measuring. Asking whether the
 * section overlaps the centre band instead is independent of section height
 * and matches what the number is supposed to mean: the section being looked at.
 */
const CENTRE_BAND = '-40% 0px -40% 0px';

const DEPTH_BUCKETS = [25, 50, 75, 100] as const;

export default function SiteAnalytics() {
  const pathname = usePathname();

  // Pageview, and a clean slate for the per-page dedupe on client navigation.
  useEffect(() => {
    resetPageState();
    track('pageview', undefined, pathname);
    // The homepage's sections are dynamically imported, so the previous page's
    // buffered events should not wait on them to settle.
    return flush;
  }, [pathname]);

  // Section visibility.
  useEffect(() => {
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;

          if (entry.isIntersecting) {
            if (timers.has(entry.target)) continue;
            timers.set(
              entry.target,
              setTimeout(() => trackOnce('section_view', id), DWELL_MS)
            );
          } else {
            const timer = timers.get(entry.target);
            if (timer) {
              clearTimeout(timer);
              timers.delete(entry.target);
            }
          }
        }
      },
      { rootMargin: CENTRE_BAND, threshold: 0 }
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('section[id]').forEach((section) => {
        if (observed.has(section)) return;
        observed.add(section);
        observer.observe(section);
      });
    };

    scan();

    // Below-the-fold sections are dynamically imported, so they appear in the
    // DOM well after this effect runs. Watching for them beats guessing a delay.
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      timers.forEach(clearTimeout);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  // Scroll depth.
  useEffect(() => {
    let deepest = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent = (window.scrollY / scrollable) * 100;
      for (const bucket of DEPTH_BUCKETS) {
        if (percent >= bucket && deepest < bucket) {
          deepest = bucket;
          trackOnce('scroll_depth', String(bucket));
        }
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}

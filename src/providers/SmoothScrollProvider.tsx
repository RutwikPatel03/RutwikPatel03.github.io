'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

interface SmoothScrollControls {
  /** Suspends scrolling until `start` is called. Safe to call when idle. */
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollControls>({
  stop: () => {},
  start: () => {},
});

/**
 * Pause scrolling while something is layered over the page.
 *
 * `overflow: hidden` on its own is not enough here. It stops the *user* from
 * scrolling, but an element with hidden overflow can still be scrolled from
 * script — which is exactly what Lenis does on every wheel and touch event, so
 * the page kept moving underneath the open menu.
 */
export function useSmoothScrollControls() {
  return useContext(SmoothScrollContext);
}

// Routes that own the full viewport and scroll inside their own containers.
// Lenis hijacks the wheel globally, so on these it stops nested panels (the
// chat transcript) from scrolling at all — and it buys nothing, because the
// page itself never scrolls.
const NO_SMOOTH_SCROLL = ['/ai'];

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (NO_SMOOTH_SCROLL.includes(pathname)) {
      return;
    }

    // Respect users who prefer reduced motion — skip JS smooth scroll
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Animation frame loop
    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  // Read through the ref at call time: on the routes above, and before the
  // effect has run, there is simply no instance to pause.
  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);
  const controls = useMemo(() => ({ stop, start }), [stop, start]);

  return (
    <SmoothScrollContext.Provider value={controls}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

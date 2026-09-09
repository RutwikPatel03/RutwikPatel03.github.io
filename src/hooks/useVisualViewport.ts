'use client';

import { useEffect, useState } from 'react';

export interface VisualViewportBox {
  /** Height of the area the reader can actually see, in CSS pixels. */
  height: number;
  /** How far that area has been pushed down the layout viewport. */
  offsetTop: number;
}

/**
 * Tracks the part of the page the reader can actually see.
 *
 * A full-screen `position: fixed` layout is sized against the *layout*
 * viewport, and on iOS the software keyboard does not shrink it — it slides
 * over the bottom of the page instead. Anything pinned to the bottom of such a
 * layout, a chat composer above all, ends up underneath the keyboard exactly
 * when it is being typed into. The visual viewport is the rectangle that does
 * shrink, so laying out against it keeps the composer above the keyboard.
 *
 * Returns null until it has measured, and on browsers with no VisualViewport
 * API, so callers can fall back to a plain CSS height rather than render at
 * zero. Server-rendered markup gets that fallback too.
 */
export function useVisualViewport(): VisualViewportBox | null {
  const [box, setBox] = useState<VisualViewportBox | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // iOS reports the pre-animation size while the keyboard is still sliding
    // in, so the read is deferred to the next frame.
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setBox({ height: vv.height, offsetTop: vv.offsetTop });
      });
    };

    measure();
    vv.addEventListener('resize', measure);
    vv.addEventListener('scroll', measure);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', measure);
      vv.removeEventListener('scroll', measure);
    };
  }, []);

  return box;
}

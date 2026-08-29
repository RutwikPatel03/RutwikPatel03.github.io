'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Holds a screen wake lock while `active`.
 *
 * This is as close as a web page can legitimately get to what people actually
 * want, which is the music surviving a locked phone. It cannot do that:
 * YouTube's developer policies forbid background play of the embedded player,
 * and iOS and Android both stop the embed the moment the tab is backgrounded.
 *
 * What a wake lock does do is stop the phone dimming and sleeping by itself,
 * which is the case that bites in practice — a phone put face-up on a table
 * with the radio on. A deliberate press of the power button still ends it.
 *
 * The browser releases the lock whenever the tab is hidden, so it has to be
 * taken again on the way back.
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [held, setHeld] = useState(false);
  const [supported, setSupported] = useState(false);

  // Read after mount: the server has no navigator, and deciding this during
  // render would make the server and client markup disagree.
  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const release = () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      setHeld(false);
      sentinel?.release().catch(() => {
        // Already released, usually because the tab was hidden.
      });
    };

    const acquire = async () => {
      if (cancelled || !active) return;
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
      if (document.hidden || sentinelRef.current) return;

      try {
        const sentinel = await navigator.wakeLock.request('screen');
        // The request is async, so playback may have stopped while it was in
        // flight. Handing back a lock nobody asked for keeps the screen on
        // over a paused radio.
        if (cancelled || !active) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setHeld(true);
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current !== sentinel) return;
          sentinelRef.current = null;
          setHeld(false);
        });
      } catch {
        // Refused: low battery, or the browser wanted a fresher user gesture.
        // The radio plays on regardless, so there is nothing to report.
      }
    };

    if (active) void acquire();
    else release();

    const onVisibility = () => {
      if (!document.hidden) void acquire();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      release();
    };
  }, [active]);

  return { held, supported };
}

'use client';

import { useEffect, useRef, useState } from 'react';

interface PresenceResponse {
  station: number;
  total: number;
  intervalMs?: number;
  success: boolean;
}

/** Stable per-tab id. Regenerated on reload, which is what we want. */
function makeSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Keeps this tab registered as a live listener on `stationId` and returns the
 * current counts. Heartbeats on the interval the server asks for, pauses while
 * the tab is hidden so background tabs do not inflate the number, and resumes
 * immediately on refocus.
 */
export function usePresence(stationId: string) {
  const [counts, setCounts] = useState<{ station: number; total: number } | null>(null);
  const sessionIdRef = useRef<string>('');
  const intervalRef = useRef<number>(15_000);

  if (!sessionIdRef.current) {
    sessionIdRef.current = makeSessionId();
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    async function beat() {
      if (cancelled) return;

      // A hidden tab is not a listener. Fall back to a read so the number
      // still updates, but stop claiming presence.
      const hidden = typeof document !== 'undefined' && document.hidden;

      try {
        const res = hidden
          ? await fetch(`/api/presence?station=${encodeURIComponent(stationId)}`)
          : await fetch('/api/presence', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ station: stationId, sessionId: sessionIdRef.current }),
            });

        const data: PresenceResponse = await res.json();
        if (!cancelled && data.success) {
          setCounts({ station: data.station, total: data.total });
          if (data.intervalMs) intervalRef.current = data.intervalMs;
        }
      } catch {
        // Network blip. Keep the last known count on screen rather than
        // flashing a zero, and try again on the next tick.
      }

      if (!cancelled) {
        timer = setTimeout(beat, intervalRef.current);
      }
    }

    beat();

    const onVisible = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        beat();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [stationId]);

  return counts;
}

'use client';

import { useEffect, useRef } from 'react';

/**
 * Holds a native audio element open alongside the YouTube player.
 *
 * iOS suspends a page's media when the screen locks, and an embedded YouTube
 * player is stopped outright. A native <audio> element that the browser owns
 * is treated differently: while one is playing, the page keeps an audio
 * session, and in some builds that session is enough to keep the iframe's
 * playback alive behind a lock screen.
 *
 * Be clear about what this is. It exists to get around YouTube's rule that an
 * embedded player must not play in the background, and it may simply not work
 * — the failure people report is a lock screen that shows controls while the
 * music has already stopped. It is behind a flag so it can be turned off
 * without unpicking anything.
 *
 * The file is one second of near-silence rather than true silence, since a
 * media element producing literal zeroes has been known to be disregarded.
 */
const SILENCE_SRC = '/silence.wav';

export function useSilentAudioKeepAlive(active: boolean, enabled: boolean) {
  const elementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Created rather than rendered, so React never re-mounts it mid-playback
    // and interrupts the very session it exists to hold.
    const audio = document.createElement('audio');
    audio.src = SILENCE_SRC;
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    // Kept out of the accessibility tree: it is not content, and it is silent.
    audio.setAttribute('aria-hidden', 'true');
    audio.style.display = 'none';
    document.body.appendChild(audio);
    elementRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.remove();
      } catch {
        // Already gone.
      }
      elementRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const audio = elementRef.current;
    if (!audio) return;

    if (active) {
      // Rides the same user gesture that started the radio, which is what
      // autoplay requires; a rejection here changes nothing else.
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [active, enabled]);
}

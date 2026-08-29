'use client';

import { useEffect } from 'react';

/**
 * Declares what the page's audio is, and wires it to the system's controls.
 *
 * Two separate platform APIs, both standard, neither a workaround:
 *
 * - The Audio Session API tells iOS this page is playing media rather than
 *   incidental noise, which is what decides whether it ducks, stops for
 *   another app, or respects the silent switch. `playback` is the value
 *   meant for music.
 * - The Media Session API supplies the title, artist and artwork the phone
 *   shows on the lock screen and in Control Centre, and accepts the
 *   play/pause/next/previous the hardware and headphone buttons send back.
 *
 * Neither grants permission to keep playing once the screen is off. Nothing
 * on the web platform does — that is the platform's call, and for an embedded
 * YouTube player the answer is no.
 */
interface AudioSessionNavigator extends Navigator {
  audioSession?: { type: string };
}

export function useMediaSession({
  title,
  artist,
  artwork,
  album,
  isPlaying,
  active,
  onPlay,
  onPause,
  onNext,
  onPrev,
}: {
  title?: string;
  artist?: string;
  artwork?: string | null;
  album?: string;
  isPlaying: boolean;
  /** False before anything has been started, so we claim nothing too early. */
  active: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  // Claim the audio session once something is actually playing.
  useEffect(() => {
    if (!active) return;
    try {
      const nav = navigator as AudioSessionNavigator;
      if (nav.audioSession) nav.audioSession.type = 'playback';
    } catch {
      // Not supported here; the browser decides on its own as before.
    }
  }, [active]);

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Rutwik Radio',
        artist: artist || '',
        album: album || '',
        artwork: artwork
          ? [
              { src: artwork, sizes: '320x180', type: 'image/jpeg' },
              { src: artwork, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // Metadata is a nicety; playback is unaffected if it fails.
    }
  }, [active, title, artist, album, artwork, isPlaying]);

  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const handlers: [MediaSessionAction, () => void][] = [
      ['play', onPlay],
      ['pause', onPause],
      ['nexttrack', onNext],
      ['previoustrack', onPrev],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Some actions are unsupported on some platforms; skip those.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Already gone.
        }
      }
    };
  }, [active, onPlay, onPause, onNext, onPrev]);
}

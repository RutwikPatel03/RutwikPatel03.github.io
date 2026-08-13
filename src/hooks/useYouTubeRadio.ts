'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RadioTrack } from '@/types/radio';

// Minimal shape of the bits of the YouTube IFrame API we actually touch.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  loadVideoById(id: string): void;
  /** Loads without autoplaying, so switching stations while paused stays paused. */
  cueVideoById(id: string): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

/** Loads the IFrame API once per page, shared across mounts. */
let apiPromise: Promise<void> | null = null;
function loadIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = IFRAME_API_SRC;
    document.head.appendChild(tag);
  });
  return apiPromise;
}

/** Fisher-Yates, so the rotation order differs per listener per session. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type RadioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'empty';

/**
 * Drives a hidden YouTube player through a shuffled rotation.
 *
 * No audio is hosted here. Each track is played from the rights holder's own
 * upload via YouTube's embedded player, so a play counts as a normal view.
 */
export function useYouTubeRadio(tracks: RadioTrack[]) {
  const [queue, setQueue] = useState<RadioTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RadioStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(70);

  const playerRef = useRef<YTPlayer | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const queueRef = useRef<RadioTrack[]>([]);
  const startedRef = useRef(false);
  /**
   * Mirrors `status` so effects can read it without listing it as a dependency
   * (which would re-run the station-swap effect on every state change).
   */
  const statusRef = useRef<RadioStatus>('idle');
  statusRef.current = status;

  // Reshuffle whenever the station's track list changes.
  //
  // A live player has to be told about the swap. Resetting only the queue left
  // the old station's video loaded, so the next play/pause acted on the wrong
  // video while the UI showed the new track, and the two fell out of sync.
  useEffect(() => {
    const playable = tracks.filter((t) => t.videoId && !t.unplayable);
    const next = shuffle(playable);
    setQueue(next);
    queueRef.current = next;
    setIndex(0);
    indexRef.current = 0;

    const player = playerRef.current;

    if (next.length === 0) {
      setStatus('empty');
      startedRef.current = false;
      try {
        player?.stopVideo();
      } catch {
        // Player already torn down.
      }
      return;
    }

    if (!player) {
      setStatus('idle');
      startedRef.current = false;
      return;
    }

    // Carry playback state across the switch: keep going if it was going,
    // stay quiet if it wasn't.
    const wasPlaying = statusRef.current === 'playing' || statusRef.current === 'loading';
    try {
      setStatus(wasPlaying ? 'loading' : 'paused');
      if (wasPlaying) player.loadVideoById(next[0].videoId!);
      else player.cueVideoById(next[0].videoId!);
    } catch {
      setStatus('idle');
    }
  }, [tracks]);

  const current = queue[index] ?? null;

  /** Advances by `step`, wrapping around the rotation. */
  const advance = useCallback((step: number) => {
    const q = queueRef.current;
    if (q.length === 0) return;
    const next = (indexRef.current + step + q.length) % q.length;
    indexRef.current = next;
    setIndex(next);
    const id = q[next]?.videoId;
    if (id && playerRef.current) {
      setStatus('loading');
      playerRef.current.loadVideoById(id);
    }
  }, []);

  const next = useCallback(() => advance(1), [advance]);
  const prev = useCallback(() => advance(-1), [advance]);

  /** Creates the player on first play, since autoplay needs a user gesture. */
  const start = useCallback(async () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (playerRef.current) {
      playerRef.current.playVideo();
      return;
    }

    setStatus('loading');
    await loadIframeApi();
    if (!window.YT?.Player || !mountRef.current) return;

    playerRef.current = new window.YT.Player(mountRef.current, {
      videoId: q[indexRef.current]?.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          e.target.setVolume(volume);
          e.target.playVideo();
          startedRef.current = true;
        },
        onStateChange: (e: { data: number }) => {
          const S = window.YT?.PlayerState;
          if (!S) return;
          if (e.data === S.ENDED) next();
          else if (e.data === S.PLAYING) setStatus('playing');
          else if (e.data === S.PAUSED) setStatus('paused');
          else if (e.data === S.BUFFERING) setStatus('loading');
          // CUED fires after cueVideoById, i.e. a station swap while paused.
          // Without it the status stuck on 'loading' and the button froze.
          else if (e.data === S.CUED) setStatus('paused');
        },
        // A video pulled or gone private should not stall the whole station.
        onError: () => next(),
      },
    });
  }, [next, volume]);

  const toggle = useCallback(() => {
    if (!playerRef.current) {
      void start();
      return;
    }
    if (status === 'playing') {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [start, status]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
  }, []);

  /**
   * Jumps to a point in the current track, given as a 0-1 fraction.
   * Updates progress immediately so the bar tracks the pointer rather than
   * waiting for the next poll tick.
   */
  const seekToFraction = useCallback((fraction: number) => {
    const player = playerRef.current;
    if (!player) return;
    const clamped = Math.min(Math.max(fraction, 0), 1);
    try {
      const duration = player.getDuration() || 0;
      if (duration <= 0) return;
      const target = duration * clamped;
      player.seekTo(target, true);
      setProgress({ current: target, duration });
    } catch {
      // Player not ready yet; the next play will start from the top.
    }
  }, []);

  /** Nudges playback by a number of seconds, positive or negative. */
  const skipSeconds = useCallback((delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const duration = player.getDuration() || 0;
      const current = player.getCurrentTime() || 0;
      if (duration <= 0) return;
      const target = Math.min(Math.max(current + delta, 0), duration);
      player.seekTo(target, true);
      setProgress({ current: target, duration });
    } catch {
      // Ignore: nothing loaded yet.
    }
  }, []);

  /** Jump straight to a track from the songs list. */
  const playAt = useCallback(
    (target: number) => {
      const q = queueRef.current;
      if (target < 0 || target >= q.length) return;
      indexRef.current = target;
      setIndex(target);
      const id = q[target]?.videoId;
      if (!playerRef.current) {
        void start();
        return;
      }
      if (id) {
        setStatus('loading');
        playerRef.current.loadVideoById(id);
      }
    },
    [start]
  );

  // Poll playback position for the progress bar.
  useEffect(() => {
    if (status !== 'playing') return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setProgress({ current: p.getCurrentTime() || 0, duration: p.getDuration() || 0 });
      } catch {
        // Player torn down mid-tick; the next effect run will clean up.
      }
    }, 500);
    return () => clearInterval(t);
  }, [status]);

  // Tear the player down on unmount so a route change stops the audio.
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy();
      } catch {
        // Already gone.
      }
      playerRef.current = null;
    };
  }, []);

  return {
    mountRef,
    queue,
    index,
    current,
    status,
    progress,
    volume,
    toggle,
    next,
    prev,
    playAt,
    setVolume,
    seekToFraction,
    skipSeconds,
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RadioTrack } from '@/types/radio';

// Minimal shape of the bits of the YouTube IFrame API we actually touch.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  loadVideoById(id: string | { videoId: string; startSeconds?: number }): void;
  /** Loads without autoplaying, so switching stations while paused stays paused. */
  cueVideoById(id: string): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
  // Playlist mode, where YouTube owns the queue instead of us.
  loadPlaylist(options: { list: string; listType: string; index?: number }): void;
  cuePlaylist(options: { list: string; listType: string; index?: number }): void;
  getPlaylist(): string[] | null;
  getPlaylistIndex(): number;
  /** Undocumented but present on most builds; used only as a cross-check. */
  getPlaylistId?(): string | null;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  setShuffle(shuffle: boolean): void;
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
const VOLUME_KEY = 'radio:volume';

/**
 * How many videos may fail back-to-back before the radio stops advancing.
 *
 * One dead upload should be skipped silently. A run of them means something
 * systemic — region blocking is the usual cause — and racing through the whole
 * rotation in silence tells the listener nothing, so we stop and say so.
 */
const MAX_CONSECUTIVE_ERRORS = 5;

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

/** What the radio should be playing through. */
export interface RadioSource {
  /**
   * The list to play. A new array identity means the rotation or station
   * changed underneath the hook.
   */
  tracks: RadioTrack[];
  /**
   * Song to jump straight to, set when the listener deliberately picked a
   * track or a station. Null means the list changed on its own — the hourly
   * rotation turn — which must never interrupt what is already playing.
   */
  startVideoId?: string | null;
  /**
   * A YouTube playlist id. When set, `tracks` is ignored and YouTube owns the
   * queue: a playlist cannot be enumerated without the Data API, so the player
   * loads it and we read the video ids back out once it is ready.
   */
  playlistId?: string | null;
  /** Where in the playlist to start. Ignored outside playlist mode. */
  startIndex?: number;
  /** Whether the player should shuffle a playlist. Ignored outside playlist mode. */
  shuffle?: boolean;
  /**
   * A playlist to roll into once `tracks` runs out.
   *
   * Used for search: YouTube builds an auto-radio for any video at
   * `RD<videoId>`, so a searched song can be followed by fifty related tracks
   * instead of looping, or marching through search results that were only ever
   * ranked by how well they matched the words you typed.
   */
  thenPlaylistId?: string | null;
}

/**
 * Drives a hidden YouTube player through a shuffled rotation.
 *
 * No audio is hosted here. Each track is played from the rights holder's own
 * upload via YouTube's embedded player, so a play counts as a normal view.
 */
export function useYouTubeRadio(source: RadioSource) {
  const [queue, setQueue] = useState<RadioTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RadioStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(70);
  /** True once too many videos have failed in a row to keep skipping blindly. */
  const [stalled, setStalled] = useState(false);
  /**
   * Which playlist the ids currently in `queue` came from, or null when the
   * queue is not a playlist's.
   *
   * Callers need this to tell a stale queue from a current one. Clearing the
   * queue on a playlist switch is a scheduled state update, so a caller
   * reading `queue` in the same pass still sees the previous playlist's songs
   * next to the new playlist's id — which is exactly how one playlist's track
   * list got written into another's.
   */
  const [loadedPlaylistId, setLoadedPlaylistId] = useState<string | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const queueRef = useRef<RadioTrack[]>([]);
  const errorStreakRef = useRef(0);
  /**
   * True while the player is being built. Two paths can ask for a first play
   * at once — picking a song from the list and hitting the transport — and
   * both would sit through the same API load and then build a player each,
   * leaving two videos playing over one another.
   */
  const startingRef = useRef(false);
  /** The playlist currently loaded, or null when playing a curated station. */
  const playlistRef = useRef<string | null>(null);
  /** Last ids read out of the player, to spot a genuinely new playlist. */
  const playlistIdsRef = useRef<string[]>([]);
  /**
   * The ids of the playlist we just left.
   *
   * `loadPlaylist` is not synchronous: for a beat afterwards `getPlaylist()`
   * still returns the OUTGOING playlist's ids. Believing them stamped one
   * playlist's songs onto another and wrote them to the library that way, so
   * a sync matching these exactly is discarded as stale.
   */
  const staleIdsRef = useRef<string[]>([]);
  /** Playlist to move into when the current track list is exhausted. */
  const thenPlaylistRef = useRef<string | null>(null);
  /** Set once `enterPlaylist` exists, so earlier callbacks can reach it. */
  const enterPlaylistRef = useRef<((list: string) => void) | null>(null);
  /**
   * The playlist the CURRENT player instance was constructed for.
   *
   * This is the only trustworthy link between a set of video ids and the
   * playlist they belong to. Everything softer — comparing ids, asking
   * getPlaylistId() — fails during a swap, because a player that is being
   * torn down keeps firing state changes and answering questions with the
   * previous playlist's data while the refs already point at the new one.
   */
  const playerPlaylistRef = useRef<string | null>(null);
  /** Where a newly loaded playlist should start, and whether to shuffle it. */
  const startIndexRef = useRef(0);
  const shuffleRef = useRef(false);
  /**
   * Mirrors `status` and `volume` so effects and the player callbacks can read
   * them without listing them as dependencies, which would otherwise re-run
   * the source effect and rebuild `start` on every state change.
   */
  const statusRef = useRef<RadioStatus>('idle');
  statusRef.current = status;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  /** Writes the new rotation and position into both state and the refs. */
  const commit = useCallback((nextQueue: RadioTrack[], nextIndex: number) => {
    queueRef.current = nextQueue;
    indexRef.current = nextIndex;
    setQueue(nextQueue);
    setIndex(nextIndex);
  }, []);

  /** Advances by `step`, wrapping around the rotation. */
  const advance = useCallback(
    (step: number) => {
      // Out of tracks with a follow-up waiting: move into it rather than
      // wrapping. This is what turns one searched song into a station.
      const follow = thenPlaylistRef.current;
      if (
        !playlistRef.current &&
        follow &&
        step > 0 &&
        indexRef.current >= queueRef.current.length - 1
      ) {
        thenPlaylistRef.current = null;
        enterPlaylistRef.current?.(follow);
        return;
      }

      // In playlist mode the player owns the order, so ask it to move rather
      // than tracking a position it would immediately overwrite.
      const player = playerRef.current;
      if (playlistRef.current && player) {
        try {
          setStatus('loading');
          if (step > 0) player.nextVideo();
          else player.previousVideo();
        } catch {
          // Playlist not loaded yet; the next state change will resync.
        }
        return;
      }

      const q = queueRef.current;
      if (q.length === 0) return;
      const nextIndex = (indexRef.current + step + q.length) % q.length;
      indexRef.current = nextIndex;
      setIndex(nextIndex);
      const id = q[nextIndex]?.videoId;
      if (id && playerRef.current) {
        setStatus('loading');
        playerRef.current.loadVideoById(id);
      }
    },
    []
  );

  /** Skips forward after a failed video, keeping the run of failures counted. */
  const advanceAfterError = useCallback(() => {
    errorStreakRef.current += 1;
    if (errorStreakRef.current >= MAX_CONSECUTIVE_ERRORS) {
      setStalled(true);
      setStatus('paused');
      return;
    }
    advance(1);
  }, [advance]);

  /** A deliberate move by the listener, which clears any run of failures. */
  const step = useCallback(
    (by: number) => {
      errorStreakRef.current = 0;
      setStalled(false);
      advance(by);
    },
    [advance]
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  /**
   * Reads the live playlist back out of the player.
   *
   * Titles are not available here — the player only hands back video ids — so
   * each track carries its id as a placeholder and the caller fills in real
   * names from /api/youtube-meta.
   */
  const syncPlaylist = useCallback(() => {
    const player = playerRef.current;
    if (!player || !playlistRef.current) return;
    const wanted = playlistRef.current;
    // Only ids from a player built for this exact playlist may be believed.
    if (playerPlaylistRef.current !== wanted) return;
    try {
      // Exact when the build offers it; most do, and it settles the question
      // before the id comparison below has to guess.
      // Cheap cross-check: this one is accurate and immediate, unlike the
      // id list below.
      const reported = player.getPlaylistId?.();
      if (typeof reported === 'string' && reported && wanted && reported !== wanted) return;

      const ids = (player.getPlaylist() || []).filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      );
      if (ids.length === 0) return;

      // Still the outgoing playlist's ids: the swap has not landed yet.
      if (staleIdsRef.current.length > 0 && ids.join() === staleIdsRef.current.join()) return;
      staleIdsRef.current = [];

      const at = player.getPlaylistIndex();
      const position = at >= 0 && at < ids.length ? at : 0;

      if (ids.join() !== playlistIdsRef.current.join()) {
        playlistIdsRef.current = ids;
        commit(
          ids.map((id) => ({ title: id, artist: '', videoId: id })),
          position
        );
        setLoadedPlaylistId(playlistRef.current);
        return;
      }
      if (position !== indexRef.current) {
        indexRef.current = position;
        setIndex(position);
      }
    } catch {
      // Player not ready; the next state change will try again.
    }
  }, [commit]);

  /** Creates the player on first play, since autoplay needs a user gesture. */
  const start = useCallback(async () => {
    const list = playlistRef.current;
    if (!list && queueRef.current.length === 0) return;

    // An existing player is only reusable if it was built for this playlist.
    if (playerRef.current && playerPlaylistRef.current === list) {
      playerRef.current.playVideo();
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      setStatus('loading');
      await loadIframeApi();
      if (!window.YT?.Player || !mountRef.current) return;
      // Re-read after the await: loading the API is slow enough that the queue
      // may have been rebuilt while we waited.
      const q = queueRef.current;
      if (!list && q.length === 0) return;

      // Events from a player we have since replaced must be ignored outright:
      // a dying instance still reports the playlist it was built for, and
      // believing it is what wrote one playlist's songs into another.
      let created: YTPlayer | null = null;
      const isCurrent = () => playerRef.current !== null && playerRef.current === created;

      created = new window.YT.Player(mountRef.current, {
        ...(list ? {} : { videoId: q[indexRef.current]?.videoId }),
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
          // loop keeps a finished playlist going round, the way a station does.
          ...(list
            ? { listType: 'playlist', list, loop: 1, index: startIndexRef.current }
            : {}),
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (!isCurrent()) return;
            e.target.setVolume(volumeRef.current);
            if (list) {
              try {
                e.target.setShuffle(shuffleRef.current);
              } catch {
                // Older player build without shuffle; playback is unaffected.
              }
            }
            e.target.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            if (!isCurrent()) return;
            const S = window.YT?.PlayerState;
            if (!S) return;

            // Every state change is a chance to notice the playlist has
            // finished loading, or moved on by itself.
            if (playlistRef.current) syncPlaylist();

            if (e.data === S.ENDED) {
              // A playlist advances itself; stepping here too would skip every
              // other song.
              if (!playlistRef.current) advance(1);
            } else if (e.data === S.PLAYING) {
              // Sound is coming out, so whatever failed before is behind us.
              errorStreakRef.current = 0;
              setStalled(false);
              setStatus('playing');
            } else if (e.data === S.PAUSED) setStatus('paused');
            else if (e.data === S.BUFFERING) setStatus('loading');
            // CUED fires after cueVideoById, i.e. a station swap while paused.
            // Without it the status stuck on 'loading' and the button froze.
            else if (e.data === S.CUED) setStatus('paused');
          },
          // A video pulled, gone private or blocked in this country should not
          // stall the station — but nor should it send us racing through the
          // whole rotation in silence.
          onError: () => {
            if (!isCurrent()) return;
            advanceAfterError();
          },
        },
      });
      playerRef.current = created;
      playerPlaylistRef.current = list;
    } finally {
      startingRef.current = false;
    }
  }, [advance, advanceAfterError, syncPlaylist]);

  /**
   * Points the player at a playlist by rebuilding it.
   *
   * Rebuilt rather than swapped in place because getPlaylist() keeps reporting
   * the previous list for seconds after loadPlaylist, which is what once wrote
   * one playlist's songs into another's cache.
   */
  const enterPlaylist = useCallback(
    (list: string, index = 0) => {
      staleIdsRef.current = playlistIdsRef.current;
      playlistRef.current = list;
      playlistIdsRef.current = [];
      startIndexRef.current = index;
      commit([], 0);
      setLoadedPlaylistId(null);
      const existing = playerRef.current;
      if (existing) {
        try {
          existing.destroy();
        } catch {
          // Already gone.
        }
        playerRef.current = null;
        playerPlaylistRef.current = null;
      }
      setStatus('loading');
      void start();
    },
    [commit, start]
  );
  enterPlaylistRef.current = enterPlaylist;

  // Reshuffle whenever the source changes.
  //
  // The rule that matters here: a list that changes on its own must not stop
  // the music. The 90s station turns its rotation over four times a day, and
  // reloading the player on that turn cut a listener's song off mid-line. So a
  // deliberate pick (`startVideoId`) loads immediately, and everything else
  // leaves the current song alone and only changes what comes next.
  useEffect(() => {
    const player = playerRef.current;

    // Playlist mode. YouTube keeps the queue, so all we do here is hand it the
    // list; syncPlaylist reads the ids back once the player has them.
    thenPlaylistRef.current = source.thenPlaylistId ?? null;

    if (source.playlistId) {
      const list = source.playlistId;
      shuffleRef.current = source.shuffle ?? false;
      if (playlistRef.current === list) {
        startIndexRef.current = source.startIndex ?? 0;
        return;
      }
      enterPlaylist(list, source.startIndex ?? 0);
      return;
    }

    // Back on a curated station, so the player is ours to drive again.
    playlistRef.current = null;
    playlistIdsRef.current = [];
    staleIdsRef.current = [];
    setLoadedPlaylistId(null);

    const playable = source.tracks.filter((t) => t.videoId && !t.unplayable);
    const shuffled = shuffle(playable);

    if (shuffled.length === 0) {
      commit([], 0);
      setStatus('empty');
      try {
        player?.stopVideo();
      } catch {
        // Player already torn down.
      }
      return;
    }

    const wanted = source.startVideoId
      ? shuffled.findIndex((t) => t.videoId === source.startVideoId)
      : -1;

    if (!player) {
      commit(shuffled, wanted >= 0 ? wanted : 0);
      if (wanted >= 0) {
        // The listener picked a song before the player existed. Build it and
        // start there; this still runs inside the activation window of the
        // click that asked for it, which is what autoplay needs.
        void start();
        return;
      }
      // Nothing to interrupt yet; the first play will start from here.
      setStatus('idle');
      return;
    }

    if (wanted >= 0) {
      commit(shuffled, wanted);
      errorStreakRef.current = 0;
      setStalled(false);
      try {
        setStatus('loading');
        player.loadVideoById(shuffled[wanted].videoId!);
      } catch {
        setStatus('idle');
      }
      return;
    }

    const playingNow = statusRef.current === 'playing' || statusRef.current === 'loading';
    const currentTrack = queueRef.current[indexRef.current] ?? null;

    if (playingNow && currentTrack) {
      // Let the song finish. If it survived into the new rotation we simply
      // point at it there; if it did not, it sits at the head of the new queue
      // as a bridge and the rotation takes over from the next song on. Both
      // lists belong to the same station, since a station change always
      // arrives with a startVideoId.
      const at = shuffled.findIndex((t) => t.videoId === currentTrack.videoId);
      if (at >= 0) commit(shuffled, at);
      else commit([currentTrack, ...shuffled], 0);
      return;
    }

    // Nothing playing: swap the loaded video without starting it, so a station
    // picked while paused stays paused.
    commit(shuffled, 0);
    try {
      setStatus('paused');
      player.cueVideoById(shuffled[0].videoId!);
    } catch {
      setStatus('idle');
    }
  }, [source, commit, start, enterPlaylist]);

  const current = queue[index] ?? null;

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

  /** Reloads the current track after a run of failures. */
  const retry = useCallback(() => {
    errorStreakRef.current = 0;
    setStalled(false);
    const id = queueRef.current[indexRef.current]?.videoId;
    if (!playerRef.current) {
      void start();
      return;
    }
    if (id) {
      setStatus('loading');
      playerRef.current.loadVideoById(id);
    }
  }, [start]);

  /** Turns shuffle on or off on a playlist that is already loaded. */
  const applyShuffle = useCallback((on: boolean) => {
    shuffleRef.current = on;
    if (!playlistRef.current) return;
    try {
      playerRef.current?.setShuffle(on);
    } catch {
      // Player not ready; the setting applies when the playlist next loads.
    }
  }, []);

  /**
   * Replaces the queue with a new order, without interrupting the song.
   *
   * In playlist mode YouTube owns the order and will advance on its own, so
   * rearranging it means taking the queue over: the current video is reloaded
   * on its own (at the same position, so nothing audible restarts), which
   * drops YouTube's playlist and leaves the order ours to keep.
   */
  const reorderQueue = useCallback(
    (nextQueue: RadioTrack[], nextIndex: number) => {
      const player = playerRef.current;
      const wasPlaylist = playlistRef.current;

      if (wasPlaylist && player) {
        const currentId = queueRef.current[indexRef.current]?.videoId;
        let at = 0;
        try {
          at = player.getCurrentTime() || 0;
        } catch {
          // Not ready; starting from the top is a fair fallback.
        }
        playlistRef.current = null;
        playlistIdsRef.current = [];
        staleIdsRef.current = [];
        playerPlaylistRef.current = null;
        setLoadedPlaylistId(null);
        // A mix would otherwise keep extending itself past the order just set.
        thenPlaylistRef.current = null;
        if (currentId) {
          try {
            player.loadVideoById({ videoId: currentId, startSeconds: Math.max(0, at - 0.4) });
          } catch {
            // Leave it playing whatever it has.
          }
        }
      }

      commit(nextQueue, nextIndex);
    },
    [commit]
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    playerRef.current?.setVolume(v);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      // Storage blocked or full. The volume still applies for this session.
    }
  }, []);

  // Restore the saved volume after mount rather than in the initial state, so
  // the server and the first client render agree on the slider.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VOLUME_KEY);
      if (saved === null) return;
      const v = Number(saved);
      if (!Number.isFinite(v) || v < 0 || v > 100) return;
      setVolumeState(v);
      playerRef.current?.setVolume(v);
    } catch {
      // No storage available; the default stands.
    }
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
      const currentTime = player.getCurrentTime() || 0;
      if (duration <= 0) return;
      const target = Math.min(Math.max(currentTime + delta, 0), duration);
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
      errorStreakRef.current = 0;
      setStalled(false);
      indexRef.current = target;
      setIndex(target);
      if (!playerRef.current) {
        void start();
        return;
      }
      if (playlistRef.current) {
        try {
          setStatus('loading');
          playerRef.current.playVideoAt(target);
        } catch {
          // Playlist not ready; the row stays where it was.
        }
        return;
      }
      const id = q[target]?.videoId;
      if (id) {
        setStatus('loading');
        playerRef.current.loadVideoById(id);
      }
    },
    [start]
  );

  // Poll playback position for the progress bar. Paused while the tab is
  // hidden: nobody is watching a progress bar they cannot see, and the poll
  // re-renders the page twice a second.
  useEffect(() => {
    if (status !== 'playing') return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setProgress({ current: p.getCurrentTime() || 0, duration: p.getDuration() || 0 });
      } catch {
        // Player torn down mid-tick; the next effect run will clean up.
      }
    };

    const startPolling = () => {
      if (timer) return;
      timer = setInterval(tick, 500);
    };
    const stopPolling = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        tick();
        startPolling();
      }
    };

    if (!document.hidden) startPolling();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
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
    stalled,
    loadedPlaylistId,
    progress,
    volume,
    toggle,
    next,
    prev,
    playAt,
    retry,
    reorderQueue,
    applyShuffle,
    setVolume,
    seekToFraction,
    skipSeconds,
  };
}

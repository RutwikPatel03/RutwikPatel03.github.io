'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SavedPlaylist, SavedTrack } from '@/types/radio';

export type { SavedPlaylist, SavedTrack };

const ENDPOINT = '/api/radio-playlists';
/** The single-playlist localStorage key this replaced. */
const LEGACY_KEY = 'radio:playlist';

type Action =
  | { action: 'add'; id: string }
  | { action: 'remove'; id: string }
  | { action: 'setName'; id: string; name: string; author?: string }
  | { action: 'cacheTracks'; id: string; tracks: SavedTrack[] };

/**
 * The radio's saved YouTube playlists.
 *
 * Server-backed rather than per-browser: the same library shows up on every
 * device, survives a cleared browser, and is there for anyone who opens the
 * station. Every mutation returns the whole new list, so the client never has
 * to guess what the server ended up with.
 */
export function usePlaylistLibrary() {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  /** False until the first fetch lands, so the UI can avoid an empty flash. */
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playlistsRef = useRef<SavedPlaylist[]>([]);
  playlistsRef.current = playlists;

  const apply = useCallback((next: SavedPlaylist[]) => {
    playlistsRef.current = next;
    setPlaylists(next);
  }, []);

  const send = useCallback(
    async (payload: Action): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          success?: boolean;
          playlists?: SavedPlaylist[];
          error?: string;
        };
        if (data.success && Array.isArray(data.playlists)) {
          apply(data.playlists);
          return true;
        }
        setError(data.error ?? 'Could not save that change.');
        return false;
      } catch {
        setError('Could not reach the server.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [apply]
  );

  // First load, plus a one-time migration of whatever the localStorage version
  // had saved so upgrading does not silently lose the playlist in use.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(ENDPOINT);
        const data = (await res.json()) as { success?: boolean; playlists?: SavedPlaylist[] };
        if (cancelled) return;
        const current = data.success && Array.isArray(data.playlists) ? data.playlists : [];
        apply(current);
        setLoaded(true);

        let legacy: string | null = null;
        try {
          legacy = window.localStorage.getItem(LEGACY_KEY);
        } catch {
          // No storage to migrate from.
        }
        if (legacy && !current.some((p) => p.id === legacy)) {
          await send({ action: 'add', id: legacy });
        }
        if (legacy) {
          try {
            window.localStorage.removeItem(LEGACY_KEY);
          } catch {
            // Migration just repeats next visit; harmless.
          }
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply, send]);

  const add = useCallback((id: string) => send({ action: 'add', id }), [send]);
  const remove = useCallback((id: string) => send({ action: 'remove', id }), [send]);
  const setName = useCallback(
    (id: string, name: string, author?: string) => send({ action: 'setName', id, name, author }),
    [send]
  );

  /**
   * Caches a playlist's songs so the library can render without the player.
   * Compares first: this is called from a render-driven effect, so posting
   * unconditionally would loop.
   */
  const cacheTracks = useCallback(
    (id: string, tracks: SavedTrack[]) => {
      if (tracks.length === 0) return;
      const found = playlistsRef.current.find((p) => p.id === id);
      if (!found) return;
      const same =
        found.tracks.length === tracks.length &&
        found.tracks.every(
          (t, i) => t.videoId === tracks[i].videoId && t.title === tracks[i].title
        );
      if (same) return;
      void send({ action: 'cacheTracks', id, tracks });
    },
    [send]
  );

  return { playlists, loaded, busy, error, add, remove, setName, cacheTracks };
}

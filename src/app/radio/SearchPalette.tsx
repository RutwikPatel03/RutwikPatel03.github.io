'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, CornerDownLeft, Loader2 } from 'lucide-react';

interface Theme {
  shade: string;
  sand: string;
  accent: string;
}

/** A song already on the site: curated catalogue or a cached playlist. */
export interface LocalSong {
  videoId: string;
  title: string;
  artist: string;
  /** Where it lives, shown as the subtitle and used to start it. */
  where: string;
  stationId?: string;
  playlistId?: string;
}

/** A station or saved playlist, matched by name. */
export interface LocalPlace {
  id: string;
  name: string;
  detail: string;
  accent: string;
  kind: 'station' | 'playlist';
}

export interface YouTubeHit {
  videoId: string;
  title: string;
  author: string;
}

const MAX_PLACES = 4;
const MAX_SONGS = 6;

function matches(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle);
}

/**
 * Search across everything on the radio, with YouTube behind an explicit press.
 *
 * The split is deliberate. Searching your own music is instant and free, so it
 * happens as you type. A YouTube search is one of a hundred the whole site
 * gets each day, so it never fires on a keystroke — only on Enter, or on the
 * row that says what it will do.
 */
export function SearchPalette({
  open,
  theme,
  songs,
  places,
  onClose,
  onPlaySong,
  onOpenPlace,
  onPlayYouTube,
}: {
  open: boolean;
  theme: Theme;
  songs: LocalSong[];
  places: LocalPlace[];
  onClose: () => void;
  onPlaySong: (song: LocalSong) => void;
  onOpenPlace: (place: LocalPlace) => void;
  onPlayYouTube: (results: YouTubeHit[], chosen: YouTubeHit) => void;
}) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<YouTubeHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  /** The phrase the YouTube results belong to, so stale ones are not shown. */
  const searchedRef = useRef('');

  // A fresh open starts clean rather than showing the last search.
  useEffect(() => {
    if (open) return;
    setQuery('');
    setHits(null);
    setError(null);
    setSearching(false);
    searchedRef.current = '';
  }, [open]);

  const trimmed = query.trim().toLowerCase();

  const localPlaces = useMemo(
    () => (trimmed ? places.filter((p) => matches(p.name, trimmed)).slice(0, MAX_PLACES) : []),
    [places, trimmed]
  );

  const localSongs = useMemo(
    () =>
      trimmed
        ? songs
            .filter((s) => matches(s.title, trimmed) || matches(s.artist, trimmed))
            .slice(0, MAX_SONGS)
        : [],
    [songs, trimmed]
  );

  const runYouTubeSearch = useCallback(async () => {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        success?: boolean;
        results?: YouTubeHit[];
        error?: string;
        remaining?: number;
      };
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
      if (data.success && data.results) {
        searchedRef.current = q;
        setHits(data.results);
        if (data.results.length === 0) setError('YouTube found nothing for that.');
      } else {
        setError(data.error ?? 'Search failed.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSearching(false);
    }
  }, [query, searching]);

  // Esc closes from anywhere in the panel, including the field.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const showYouTubeRow = trimmed.length > 1 && searchedRef.current !== query.trim();
  const heading = (text: string, note?: string) => (
    <div className="flex items-center gap-2 px-2 pb-1 pt-3 text-[0.6rem] uppercase tracking-[0.2em] opacity-40">
      {text}
      {note && <span className="tracking-normal">{note}</span>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-start sm:pt-[12vh]"
      style={{ backgroundColor: '#000000c4' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border sm:rounded-2xl"
        style={{
          backgroundColor: theme.shade,
          borderColor: `${theme.sand}22`,
          color: theme.sand,
          boxShadow: '0 30px 90px #000a',
        }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: `${theme.sand}18` }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: theme.accent }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runYouTubeSearch();
            }}
            placeholder="Search songs, playlists, stations…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
            style={{ color: theme.sand }}
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 rounded-full p-1 opacity-50 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3" data-lenis-prevent>
          {!trimmed && (
            <p className="px-3 py-8 text-center text-xs opacity-45">
              Your music is searched as you type. Press Enter to search YouTube.
            </p>
          )}

          {localPlaces.length > 0 && (
            <>
              {heading('stations & playlists')}
              {localPlaces.map((p) => (
                <button
                  key={`${p.kind}-${p.id}`}
                  onClick={() => onOpenPlace(p)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: p.accent }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                  <span className="shrink-0 font-mono text-[0.7rem] opacity-40">{p.detail}</span>
                </button>
              ))}
            </>
          )}

          {localSongs.length > 0 && (
            <>
              {heading('in your music')}
              {localSongs.map((s) => (
                <button
                  key={`${s.videoId}-${s.where}`}
                  onClick={() => onPlaySong(s)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${s.videoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-8 w-14 shrink-0 rounded object-cover"
                    style={{ backgroundColor: `${theme.sand}12` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{s.title}</span>
                    <span className="block truncate text-[0.7rem] opacity-50">
                      {[s.artist, s.where].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              ))}
            </>
          )}

          {trimmed && localPlaces.length === 0 && localSongs.length === 0 && !hits && (
            <p className="px-3 pb-1 pt-6 text-center text-xs opacity-45">
              Nothing in your music matches that.
            </p>
          )}

          {/* The one expensive action, never automatic. */}
          {showYouTubeRow && (
            <button
              onClick={() => void runYouTubeSearch()}
              disabled={searching}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: `${theme.accent}55` }}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: theme.accent }} />
              ) : (
                <Search className="h-4 w-4 shrink-0" style={{ color: theme.accent }} />
              )}
              <span className="min-w-0 flex-1 truncate text-sm" style={{ color: theme.accent }}>
                {searching ? 'Searching YouTube…' : `Search YouTube for “${query.trim()}”`}
              </span>
              {!searching && (
                <span className="flex shrink-0 items-center gap-1 font-mono text-[0.65rem] opacity-45">
                  <CornerDownLeft className="h-3 w-3" />
                  enter
                </span>
              )}
            </button>
          )}

          {error && (
            <p className="px-3 pt-3 text-xs" style={{ color: '#ff8080' }}>
              {error}
            </p>
          )}

          {hits && hits.length > 0 && (
            <>
              {heading(
                'from youtube',
                remaining !== null ? `${remaining} searches left today` : undefined
              )}
              {hits.map((h) => (
                <button
                  key={h.videoId}
                  onClick={() => onPlayYouTube(hits, h)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${h.videoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-8 w-14 shrink-0 rounded object-cover"
                    style={{ backgroundColor: `${theme.sand}12` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{h.title}</span>
                    <span className="block truncate text-[0.7rem] opacity-50">{h.author}</span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

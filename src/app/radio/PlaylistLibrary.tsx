'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, ListPlus, Pencil, Play, Shuffle, Trash2, X } from 'lucide-react';
import type { SavedPlaylist, SavedTrack } from '@/types/radio';
import { parsePlaylistId } from '@/data/radio';

interface Theme {
  shade: string;
  sand: string;
  accent: string;
}

function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * A playlist's cover: the first four songs as a 2x2 mosaic.
 *
 * This is what makes the library scannable — you recognise a playlist by its
 * art before you read the name. Falls back to fewer tiles, or to a flat panel
 * when the tracks have not been cached yet.
 */
const Mosaic = memo(function Mosaic({
  tracks,
  image,
  alt,
  theme,
  className,
}: {
  tracks: SavedTrack[];
  /** The playlist's own cover, when YouTube gave us one. */
  image?: string;
  alt?: string;
  theme: Theme;
  className: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  // A real cover beats a mosaic of stills: it is the art the playlist was
  // published with, and it is what the listener recognises. A cover that fails
  // to load falls through to the mosaic rather than leaving a broken tile.
  if (image && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        onError={() => setImageFailed(true)}
        className={`${className} rounded-xl border object-cover`}
        style={{ borderColor: `${theme.sand}18`, backgroundColor: `${theme.sand}12` }}
      />
    );
  }

  const tiles = tracks.slice(0, 4);

  if (tiles.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-xl border`}
        style={{ borderColor: `${theme.sand}18`, backgroundColor: `${theme.accent}12` }}
        aria-hidden
      >
        <ListPlus className="h-6 w-6 opacity-30" />
      </div>
    );
  }

  return (
    <div
      className={`${className} grid overflow-hidden rounded-xl border`}
      style={{
        borderColor: `${theme.sand}18`,
        // One song shows one cover; anything more fills a 2x2.
        gridTemplateColumns: tiles.length === 1 ? '1fr' : 'repeat(2, 1fr)',
        gridTemplateRows: tiles.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
      }}
      aria-hidden
    >
      {tiles.map((t, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${t.videoId}-${i}`}
          src={thumbnailFor(t.videoId)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ backgroundColor: `${theme.sand}12` }}
        />
      ))}
    </div>
  );
});

/** One playlist in the library grid. */
const PlaylistCard = memo(function PlaylistCard({
  playlist,
  theme,
  onOpen,
}: {
  playlist: SavedPlaylist;
  theme: Theme;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onOpen(playlist.id)}
      // flex-col, because a button vertically centres its own content: the
      // grid stretches every card to the tallest in its row, and a card whose
      // title fits on one line then had its artwork pushed down by half the
      // difference, leaving the row visibly out of line.
      className="group flex flex-col text-left"
      aria-label={`Open ${playlist.name}`}
    >
      <div className="relative">
        <Mosaic
          tracks={playlist.tracks}
          image={playlist.image}
          theme={theme}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span
          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          style={{ backgroundColor: theme.accent, color: theme.shade }}
        >
          <Play className="h-5 w-5 translate-x-px" fill="currentColor" />
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{playlist.name}</p>
      <p className="mt-0.5 font-mono text-xs tabular-nums opacity-50">
        {playlist.tracks.length > 0 ? `${playlist.tracks.length} songs` : 'not loaded yet'}
      </p>
    </button>
  );
});

/** One row of the open playlist. */
const PlaylistRow = memo(function PlaylistRow({
  track,
  position,
  isNow,
  theme,
  onPlay,
}: {
  track: SavedTrack;
  position: number;
  isNow: boolean;
  theme: Theme;
  onPlay: (videoId: string) => void;
}) {
  return (
    <li>
      <button
        onClick={() => onPlay(track.videoId)}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
        style={isNow ? { backgroundColor: `${theme.accent}1f` } : undefined}
      >
        <span className="relative w-5 shrink-0 text-center">
          <span
            className="font-mono text-xs tabular-nums transition-opacity group-hover:opacity-0"
            style={{ color: isNow ? theme.accent : undefined, opacity: isNow ? 1 : 0.4 }}
          >
            {isNow ? '▶' : position}
          </span>
          <Play
            className="absolute inset-0 m-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-80"
            fill="currentColor"
          />
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailFor(track.videoId)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-9 w-16 shrink-0 rounded object-cover"
          style={{ backgroundColor: `${theme.sand}12` }}
        />

        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-sm font-medium"
            style={isNow ? { color: theme.accent } : undefined}
          >
            {track.title}
          </span>
          <span className="block truncate text-xs opacity-55">{track.artist}</span>
        </span>
      </button>
    </li>
  );
});

/**
 * The My Playlist station: a library of saved playlists that opens into one.
 *
 * Everything here reads from the cached tracks rather than from the player, so
 * a reload paints the full library and track list with nothing playing.
 */
export function PlaylistLibrary({
  playlists,
  loaded,
  busy,
  serverError,
  theme,
  openId,
  nowPlayingVideoId,
  isPlayingThis,
  shuffle,
  onOpen,
  onBack,
  onAdd,
  onRemove,
  onRename,
  onPlayPlaylist,
  onPlayTrack,
  onToggleShuffle,
}: {
  playlists: SavedPlaylist[];
  loaded: boolean;
  busy: boolean;
  serverError: string | null;
  theme: Theme;
  openId: string | null;
  nowPlayingVideoId: string | null;
  isPlayingThis: boolean;
  shuffle: boolean;
  onOpen: (id: string) => void;
  onBack: () => void;
  onAdd: (id: string) => Promise<boolean>;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => Promise<boolean>;
  onPlayPlaylist: (id: string) => void;
  onPlayTrack: (id: string, videoId: string) => void;
  onToggleShuffle: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  /** Non-null while the open playlist's name is being edited. */
  const [draftName, setDraftName] = useState<string | null>(null);

  const open = openId ? (playlists.find((p) => p.id === openId) ?? null) : null;

  const submit = useCallback(async () => {
    const id = parsePlaylistId(input);
    if (!id) {
      setError('That does not look like a YouTube playlist link.');
      return;
    }
    setError(null);
    // Keep the sheet open until the server confirms, so a rejected playlist
    // (private, or a bad link) can say why instead of vanishing silently.
    const ok = await onAdd(id);
    if (ok) {
      setInput('');
      setAdding(false);
    }
  }, [input, onAdd]);

  const commitName = useCallback(async () => {
    if (!open || draftName === null) return;
    const name = draftName.trim();
    if (!name || name === open.name) {
      setDraftName(null);
      return;
    }
    const ok = await onRename(open.id, name);
    if (ok) setDraftName(null);
  }, [open, draftName, onRename]);

  const playTrack = useCallback(
    (videoId: string) => {
      if (open) onPlayTrack(open.id, videoId);
    },
    [open, onPlayTrack]
  );

  // ---------- one playlist, opened ----------
  if (open) {
    return (
      <div className="w-full max-w-4xl px-1 text-left">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-xs opacity-65 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="h-4 w-4" />
          All playlists
        </button>

        <div className="flex flex-col gap-7 sm:flex-row sm:gap-8">
          <div className="w-full max-w-[220px] shrink-0 self-center sm:self-start">
            <Mosaic
              tracks={open.tracks}
              image={open.image}
              theme={theme}
              className="aspect-square w-full shadow-2xl"
            />

            {/* Renaming matters here because YouTube will not always tell us
                what a playlist is called — its curated mixes have no public
                title — so some arrive under a placeholder. */}
            {draftName === null ? (
              <div className="mt-4 flex items-start gap-2">
                <h2 className="text-balance text-xl font-bold leading-tight sm:text-2xl">
                  {open.name}
                </h2>
                <button
                  onClick={() => setDraftName(open.name)}
                  aria-label="Rename this playlist"
                  className="mt-1 shrink-0 rounded-full p-1.5 opacity-45 transition-opacity hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void commitName();
                    if (e.key === 'Escape') setDraftName(null);
                  }}
                  aria-label="Playlist name"
                  className="min-w-0 flex-1 rounded-lg border bg-transparent px-2.5 py-1.5 text-lg font-bold outline-none"
                  style={{ borderColor: `${theme.accent}55`, color: theme.sand }}
                />
                <button
                  onClick={() => void commitName()}
                  disabled={!draftName.trim() || busy}
                  aria-label="Save name"
                  className="shrink-0 rounded-full p-2 disabled:opacity-40"
                  style={{ backgroundColor: theme.accent, color: theme.shade }}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="mt-1.5 font-mono text-xs tabular-nums opacity-50">
              {open.tracks.length > 0 ? `${open.tracks.length} songs` : 'press play to load'}
              {open.author ? ` · ${open.author}` : ''}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onPlayPlaylist(open.id)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: theme.accent, color: theme.shade }}
              >
                <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
                Play
              </button>
              <button
                onClick={onToggleShuffle}
                aria-pressed={shuffle}
                title="Shuffle this playlist"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
                style={{
                  borderColor: shuffle ? theme.accent : `${theme.sand}30`,
                  color: shuffle ? theme.accent : theme.sand,
                  backgroundColor: shuffle ? `${theme.accent}22` : 'transparent',
                }}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              {/* Two-step, so a mis-tap cannot drop a playlist. */}
              <button
                onClick={() => {
                  if (confirmRemove) {
                    onRemove(open.id);
                    setConfirmRemove(false);
                    return;
                  }
                  setConfirmRemove(true);
                }}
                onBlur={() => setConfirmRemove(false)}
                title="Remove this playlist"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-3 text-xs transition-colors"
                style={
                  confirmRemove
                    ? { borderColor: '#ff8080', color: '#ff8080' }
                    : { borderColor: `${theme.sand}30`, opacity: 0.6 }
                }
              >
                <Trash2 className="h-4 w-4" />
                {confirmRemove ? 'Sure?' : ''}
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {open.tracks.length === 0 ? (
              <p className="py-10 text-center text-sm opacity-55">
                Press play and the songs will appear here, then stay for next time.
              </p>
            ) : (
              <ul className="max-h-[46vh] space-y-0.5 overflow-y-auto overscroll-contain pr-1" data-lenis-prevent>
                {open.tracks.map((t, i) => (
                  <PlaylistRow
                    key={`${t.videoId}-${i}`}
                    track={t}
                    position={i + 1}
                    isNow={isPlayingThis && t.videoId === nowPlayingVideoId}
                    theme={theme}
                    onPlay={playTrack}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- the library ----------
  return (
    <div className="w-full max-w-4xl px-1 text-left">
      <div className="flex items-end justify-between gap-5">
        <div>
          <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
            Your playlists
          </h1>
          <p className="mt-1.5 font-mono text-xs tabular-nums opacity-50">
            {!loaded
              ? ' '
              : playlists.length === 0
                ? 'nothing saved yet'
                : `${playlists.length} saved · ${playlists.reduce((n, p) => n + p.tracks.length, 0)} songs`}
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {playlists.map((p) => (
          <PlaylistCard key={p.id} playlist={p} theme={theme} onOpen={onOpen} />
        ))}

        <button onClick={() => setAdding(true)} className="flex flex-col text-left">
          <span
            className="flex aspect-square w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed transition-colors hover:bg-white/5"
            style={{ borderColor: `${theme.sand}30`, opacity: 0.65 }}
          >
            <ListPlus className="h-7 w-7" />
            <span className="text-xs font-medium">Add playlist</span>
          </span>
          <span className="mt-3 block text-sm font-semibold opacity-45">Paste a link</span>
          <span className="mt-0.5 block font-mono text-xs opacity-30">from YouTube</span>
        </button>
      </div>

      {/* ---------- add sheet ---------- */}
      {adding && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
          style={{ backgroundColor: '#000000b8' }}
          onClick={() => setAdding(false)}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-2xl border p-6 sm:rounded-2xl"
            style={{
              backgroundColor: theme.shade,
              borderColor: `${theme.sand}22`,
              color: theme.sand,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Add a playlist</h2>
                <p className="mt-1.5 text-xs leading-relaxed opacity-60">
                  Paste a YouTube or YouTube Music playlist link. It is saved on this device, so
                  it is here next time.
                </p>
              </div>
              <button
                onClick={() => setAdding(false)}
                aria-label="Close"
                className="rounded-full p-1.5 opacity-60 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <input
                autoFocus
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void submit();
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="https://music.youtube.com/playlist?list=…"
                aria-label="YouTube playlist link"
                className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2.5 text-sm outline-none"
                style={{ borderColor: `${theme.accent}55`, color: theme.sand }}
              />
              <button
                onClick={() => void submit()}
                disabled={!input.trim() || busy}
                className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: theme.accent, color: theme.shade }}
              >
                {busy ? 'Checking…' : 'Load'}
              </button>
            </div>

            {(error || serverError) && (
              <p className="mt-2.5 text-xs" style={{ color: '#ff8080' }}>
                {error ?? serverError}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed opacity-45">
              Public or unlisted only — YouTube refuses to embed private playlists.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

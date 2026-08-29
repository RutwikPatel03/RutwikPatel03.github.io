'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  Search as SearchIcon,
  X,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  allStations,
  stations,
  playlistStation,
  getStation,
  rotationForNow,
  tracksForRotation,
  rotationCounts,
  DEFAULT_STATION_ID,
  PLAYLIST_STATION_ID,
} from '@/data/radio';
import type { RotationId, RadioTrack } from '@/types/radio';
import { usePresence } from '@/hooks/usePresence';
import { useYouTubeRadio, type RadioSource } from '@/hooks/useYouTubeRadio';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useMediaSession } from '@/hooks/useMediaSession';
import { usePlaylistLibrary } from '@/hooks/usePlaylistLibrary';
import { PlaylistLibrary } from './PlaylistLibrary';
import { NowPlayingSheet } from './NowPlayingSheet';
import {
  SearchPalette,
  type LocalSong,
  type LocalPlace,
  type YouTubeHit,
} from './SearchPalette';
import { useYouTubeMeta } from '@/hooks/useYouTubeMeta';
import { RadioBackdrop } from './RadioBackdrop';
import { Scrubber, formatTime } from './Scrubber';
import { track } from '@/lib/analytics-client';

const STATION_KEY = 'radio:station';
/** Marks a source that came from a search rather than from a station. */
const SEARCH_SOURCE_ID = 'search';

/**
 * YouTube's own thumbnail for a video.
 *
 * Loaded straight from i.ytimg.com rather than through next/image: these are
 * already CDN-served JPEGs at exactly the size the row needs, so routing three
 * hundred of them through the optimizer would cost bandwidth and buy nothing.
 */
function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * A song's thumbnail, or a tinted placeholder holding the same space when
 * there is no video to draw one from. Reserving the box either way keeps rows
 * from reflowing as images arrive.
 */
function Thumb({
  videoId,
  sand,
  className,
}: {
  videoId: string | null | undefined;
  sand: string;
  className: string;
}) {
  if (!videoId) {
    return (
      <span
        aria-hidden
        className={`${className} shrink-0 rounded`}
        style={{ backgroundColor: `${sand}12` }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbnailFor(videoId)}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${className} shrink-0 rounded object-cover`}
      style={{ backgroundColor: `${sand}12` }}
    />
  );
}

/** What the rotation chips can be set to, beyond the station's own rotations. */
type RotationChoice = RotationId | 'all';

/** The list the player is working through, plus which station it came from. */
interface PlayingSource extends RadioSource {
  stationId: string;
}


/**
 * One row of the song drawer.
 *
 * Memoised on purpose. The progress bar polls twice a second, which re-renders
 * the page, and a station can hold 96 of these rows; without the memo the whole
 * list reconciled on every tick with nothing about it having changed.
 */
const TrackRow = memo(function TrackRow({
  track: t,
  position,
  playable,
  isNow,
  accent,
  sand,
  shade,
  canEdit,
  pasteOpen,
  pasteValue,
  saving,
  confirmingRemove,
  message,
  onPlay,
  onTogglePaste,
  onPasteChange,
  onSubmitPaste,
  onClosePaste,
  onArmRemove,
  onDisarmRemove,
}: {
  track: RadioTrack;
  position: number;
  playable: boolean;
  isNow: boolean;
  accent: string;
  sand: string;
  shade: string;
  canEdit: boolean;
  pasteOpen: boolean;
  pasteValue: string;
  saving: boolean;
  confirmingRemove: boolean;
  message: { ok: boolean; text: string } | null;
  onPlay: (track: RadioTrack) => void;
  onTogglePaste: (title: string) => void;
  onPasteChange: (value: string) => void;
  onSubmitPaste: (title: string) => void;
  onClosePaste: () => void;
  onArmRemove: (title: string) => void;
  onDisarmRemove: (title: string) => void;
}) {
  const query = [t.title, (t.artist || '').split(',')[0], t.album, 'official song']
    .filter(Boolean)
    .join(' ');

  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
        style={isNow ? { backgroundColor: `${accent}1f` } : undefined}
      >
        <span className="w-6 shrink-0 font-mono text-xs opacity-40">{position}</span>

        <Thumb videoId={t.videoId} sand={sand} className="h-9 w-16" />

        <button
          onClick={() => playable && onPlay(t)}
          disabled={!playable}
          className="min-w-0 flex-1 text-left disabled:cursor-default"
          style={{ opacity: playable ? 1 : 0.45 }}
        >
          <span className="block truncate text-sm font-medium">{t.title}</span>
          <span className="block truncate text-xs opacity-60">
            {[t.artist, t.album, t.year].filter(Boolean).join(' · ')}
          </span>
        </button>

        {isNow && (
          <span
            className="shrink-0 text-[0.65rem] uppercase tracking-widest"
            style={{ color: accent }}
          >
            now
          </span>
        )}

        {!playable && canEdit && (
          <>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noreferrer noopener"
              title="Search YouTube for this song"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10"
              style={{ borderColor: `${sand}30` }}
            >
              <Search className="h-3 w-3" />
              Search
            </a>
            <button
              onClick={() => onTogglePaste(t.title)}
              className="shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10"
              style={{ borderColor: pasteOpen ? accent : `${sand}30` }}
            >
              Paste link
            </button>
            {/* Two-step: arming first means a stray click cannot delete a
                track from the source file. */}
            <button
              onClick={() => onArmRemove(t.title)}
              onBlur={() => onDisarmRemove(t.title)}
              disabled={saving}
              title="Remove this song from the catalogue"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10 disabled:opacity-40"
              style={
                confirmingRemove
                  ? { borderColor: '#ff8080', color: '#ff8080' }
                  : { borderColor: `${sand}30` }
              }
            >
              <Trash2 className="h-3 w-3" />
              {confirmingRemove ? 'Sure?' : 'Remove'}
            </button>
          </>
        )}
      </div>

      {pasteOpen && canEdit && (
        <div className="flex items-center gap-2 px-3 pb-3 pl-11">
          <input
            autoFocus
            value={pasteValue}
            onChange={(e) => onPasteChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitPaste(t.title);
              if (e.key === 'Escape') onClosePaste();
            }}
            placeholder="Paste the YouTube link here"
            className="min-w-0 flex-1 rounded-md border bg-transparent px-2.5 py-1.5 text-xs outline-none"
            style={{ borderColor: `${sand}30`, color: sand }}
          />
          <button
            onClick={() => onSubmitPaste(t.title)}
            disabled={saving || !pasteValue.trim()}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            style={{ backgroundColor: accent, color: shade }}
          >
            {saving ? 'Checking…' : 'Save'}
          </button>
        </div>
      )}

      {message && (
        <p
          className="flex items-start gap-1.5 px-3 pb-2 pl-11 text-[0.7rem]"
          style={{ color: message.ok ? accent : '#ff8080' }}
        >
          {message.ok ? (
            <Check className="mt-px h-3 w-3 shrink-0" />
          ) : (
            <AlertCircle className="mt-px h-3 w-3 shrink-0" />
          )}
          {message.text}
        </p>
      )}
    </li>
  );
});

export function RadioClient({
  initialStationId,
  hasExplicitStation = false,
}: {
  initialStationId: string;
  hasExplicitStation?: boolean;
}) {
  const [stationId, setStationId] = useState(initialStationId);
  const [listOpen, setListOpen] = useState(false);
  const [clock, setClock] = useState('');
  /**
   * null means "follow the clock" and a rotation id pins that rotation.
   * 'all' plays the station's whole catalogue, which is otherwise unreachable:
   * every hour of the day belongs to some slot, so without it the 90s station
   * could only ever play the 13-27 songs of whichever rotation was on air.
   */
  const [pickedRotation, setPickedRotation] = useState<RotationChoice | null>(null);

  /** Which saved playlist is open, or null for the library grid. */
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** switchStation is defined further down; the palette needs it earlier. */
  const switchStationRef = useRef<((id: string) => void) | null>(null);
  /**
   * Your own playlist has an order you chose, so it plays in that order unless
   * you ask otherwise. The curated stations still shuffle — that is the point
   * of a radio — but a playlist is not a radio.
   */
  const [playlistShuffle, setPlaylistShuffle] = useState(false);
  const library = usePlaylistLibrary();

  // Inline resolver state, for filling in tracks that have no video yet.
  const [openPaste, setOpenPaste] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [resolveMsg, setResolveMsg] = useState<{ title: string; ok: boolean; text: string } | null>(
    null
  );
  /** Titles removed this session, hidden immediately so the list stays honest. */
  const [removed, setRemoved] = useState<string[]>([]);
  /** Remove is two-step: the first click arms it, the second does it. */
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const station = useMemo(() => getStation(stationId), [stationId]);
  const isPlaylistStation = station.id === PLAYLIST_STATION_ID;

  // Which rotation is scheduled right now, recomputed as the hour turns.
  const [scheduled, setScheduled] = useState(() => rotationForNow(station)?.id ?? null);
  useEffect(() => {
    const sync = () => setScheduled(rotationForNow(station)?.id ?? null);
    sync();
    const t = setInterval(sync, 60_000);
    return () => clearInterval(t);
  }, [station]);

  // 'all' resolves to null, which tracksForRotation reads as "everything".
  const activeRotationId: RotationId | null =
    pickedRotation === 'all' ? null : (pickedRotation ?? scheduled);
  const activeRotation = station.rotations?.find((r) => r.id === activeRotationId) ?? null;
  const counts = useMemo(() => rotationCounts(station), [station]);

  const tracks = useMemo(
    () => tracksForRotation(station, activeRotationId),
    [station, activeRotationId]
  );

  /**
   * What is actually producing audio, which is deliberately separate from what
   * is on screen. Browsing another station should not interrupt the music, the
   * way flicking through albums does not stop what is playing.
   *
   * Null means nothing has been started yet, in which case the player follows
   * the viewed station so the very first play works on the user's click, with
   * the gesture browsers require for autoplay still intact.
   */
  const [playingSource, setPlayingSource] = useState<PlayingSource | null>(null);

  /**
   * What the player is fed. Memoised so its identity only changes when the
   * rotation or station actually changes: the hook reshuffles on every new
   * identity, so a fresh object each render would reshuffle forever.
   */
  const source = useMemo<PlayingSource>(
    () =>
      playingSource ?? {
        stationId: station.id,
        tracks,
        startVideoId: null,
        playlistId: null,
      },
    [playingSource, station.id, tracks]
  );

  const radio = useYouTubeRadio(source);

  /**
   * A search result belongs to no station. getStation falls back to the first
   * station for an id it does not know, so the bar used to label a searched
   * song "Saloon 90s" and offer to switch you there. Borrow the page's own
   * colours instead, and say where the song actually came from.
   */
  const isSearchSource = playingSource?.stationId === SEARCH_SOURCE_ID;
  const playingStation = isSearchSource ? station : getStation(source.stationId);
  /**
   * Presence follows the audio, not the page. Counting the station being
   * browsed put a listener in Gully's tally while Saloon was in their ears,
   * and showed them Gully's number under a live dot on Saloon's page.
   */
  const presence = usePresence(playingStation.id);
  const isBrowsingElsewhere =
    !!playingSource && !isSearchSource && playingSource.stationId !== station.id;
  /** Playable tracks in the station on screen, which is not always the queue. */
  const playableCount = useMemo(
    () => tracks.filter((t) => t.videoId && !t.unplayable).length,
    [tracks]
  );

  const {
    current,
    status,
    progress,
    queue,
    index,
    loadedPlaylistId,
    toggle,
    next,
    prev,
    playAt,
    volume,
    stalled,
    retry,
    applyShuffle,
    reorderQueue,
    setVolume,
    seekToFraction,
    skipSeconds,
  } = radio;

  /**
   * Sends a pasted YouTube link to the dev-only API, which verifies the video
   * really exists and is playable before writing it into the data file.
   */
  /**
   * Read through a ref rather than the dependency list: the drawer's rows are
   * memoised, and a submit handler that changed on every keystroke would
   * re-render all of them for each character typed.
   */
  const pasteValueRef = useRef('');
  pasteValueRef.current = pasteValue;

  const submitPaste = useCallback(
    async (title: string) => {
      const url = pasteValueRef.current;
      if (!url.trim()) return;
      setSaving(true);
      setResolveMsg(null);
      try {
        const res = await fetch('/api/radio-resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station: station.id, title, url }),
        });
        const data = await res.json();
        if (data.success) {
          setResolveMsg({
            title,
            ok: true,
            text: `Saved ${data.videoId}${data.channel ? ` (${data.channel})` : ''}. Reload to hear it.`,
          });
          setOpenPaste(null);
          setPasteValue('');
        } else {
          setResolveMsg({ title, ok: false, text: data.error || 'Could not save that link' });
        }
      } catch {
        setResolveMsg({ title, ok: false, text: 'Request failed. Is the dev server running?' });
      } finally {
        setSaving(false);
      }
    },
    [station.id]
  );

  // Several paths can start the music (transport button, picking a song,
  // switching station), and they all land on playingSource. Watching it here
  // records "started listening to X" once per switch instead of instrumenting
  // each handler and drifting apart from them.
  useEffect(() => {
    if (playingSource) track('radio_play', playingSource.stationId);
  }, [playingSource]);

  /**
   * Main transport. Before anything is playing this pins the viewed station as
   * the source, so the click that starts the music is the same click that
   * satisfies the browser's autoplay gesture requirement. Afterwards it just
   * toggles whatever is already playing, even while browsing another station.
   */
  const handleToggle = useCallback(() => {
    // Pin the memoised source object itself. Building an equivalent new object
    // here would change its identity and make the hook reshuffle the queue out
    // from under the very click that started it.
    if (!playingSource) setPlayingSource(source);
    toggle();
  }, [playingSource, source, toggle]);

  /**
   * Picking a song out of the list. If it belongs to a station other than the
   * one playing, switch the source across and remember which track to land on
   * once that queue has been built.
   */
  /**
   * Everything searchable without spending anything: the curated catalogue
   * plus every track cached from a saved playlist.
   */
  const searchSongs = useMemo<LocalSong[]>(() => {
    const out: LocalSong[] = [];
    for (const s of stations) {
      for (const t of s.tracks) {
        if (!t.videoId || t.unplayable) continue;
        out.push({
          videoId: t.videoId,
          title: t.title,
          artist: t.artist,
          where: s.name,
          stationId: s.id,
        });
      }
    }
    for (const p of library.playlists) {
      for (const t of p.tracks) {
        out.push({
          videoId: t.videoId,
          title: t.title,
          artist: t.artist,
          where: p.name,
          playlistId: p.id,
        });
      }
    }
    return out;
  }, [library.playlists]);

  const searchPlaces = useMemo<LocalPlace[]>(
    () => [
      ...stations.map((s) => ({
        id: s.id,
        name: s.name,
        detail: `${s.tracks.length} songs`,
        accent: s.theme.accent,
        kind: 'station' as const,
      })),
      ...library.playlists.map((p) => ({
        id: p.id,
        name: p.name,
        detail: p.tracks.length > 0 ? `${p.tracks.length} songs` : 'playlist',
        accent: playlistStation.theme.accent,
        kind: 'playlist' as const,
      })),
    ],
    [library.playlists]
  );

  /**
   * Swiping the bar skips a track, the way every phone music app works.
   *
   * The bar's own buttons were 32px on a phone — under the 44px a finger
   * needs — and they sit inside a bar that opens the queue when tapped, so a
   * near miss expanded the player instead of skipping. Bigger targets fix the
   * miss; this makes the common action not need aiming at all.
   *
   * The bar sits outside the page's drag layer, so this never collides with
   * the swipe that changes station.
   */
  const barTouchRef = useRef<{ x: number; y: number } | null>(null);
  const barSwipedAtRef = useRef(0);

  const onBarTouchStart = useCallback((e: React.TouchEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[role="slider"]')) {
      barTouchRef.current = null;
      return;
    }
    const t = e.touches[0];
    barTouchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onBarTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = barTouchRef.current;
      barTouchRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      barSwipedAtRef.current = Date.now();
      if (dx < 0) next();
      else prev();
    },
    [next, prev]
  );

  /** A swipe must not also count as the tap that opens the queue. */
  const onBarClickCapture = useCallback((e: React.MouseEvent) => {
    if (Date.now() - barSwipedAtRef.current > 500) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const backToLibrary = useCallback(() => setOpenPlaylistId(null), []);
  const togglePlaylistShuffle = useCallback(() => {
    setPlaylistShuffle((on) => {
      applyShuffle(!on);
      return !on;
    });
  }, [applyShuffle]);

  /** Starts one of the saved playlists, from the top. */
  const playPlaylist = useCallback(
    (id: string) => {
      setPlayingSource({
        stationId: PLAYLIST_STATION_ID,
        tracks: [],
        startVideoId: null,
        playlistId: id,
        shuffle: playlistShuffle,
      });
    },
    [playlistShuffle]
  );

  /** Starts a saved playlist at a particular song. */
  const playPlaylistTrack = useCallback(
    (id: string, videoId: string) => {
      // Same guard as the cache: the live queue is only this playlist's once
      // the player has actually handed its ids over.
      const alreadyOn = playingSource?.playlistId === id && loadedPlaylistId === id;
      if (alreadyOn) {
        const i = queue.findIndex((q) => q.videoId === videoId);
        if (i >= 0) {
          playAt(i);
          return;
        }
      }
      // Not loaded yet: hand the player the list and the song to land on. The
      // index comes from the cached order, which is the order YouTube gave us.
      const saved = library.playlists.find((p) => p.id === id);
      const startIndex = saved ? saved.tracks.findIndex((t) => t.videoId === videoId) : -1;
      setPlayingSource({
        stationId: PLAYLIST_STATION_ID,
        tracks: [],
        startVideoId: null,
        playlistId: id,
        startIndex: startIndex >= 0 ? startIndex : 0,
        // Picking a specific song means playing from there, not scattering.
        shuffle: false,
      });
    },
    [playingSource, queue, playAt, library.playlists, loadedPlaylistId]
  );

  /** Plays a song found in the catalogue or in a saved playlist. */
  const playSearchSong = useCallback(
    (song: LocalSong) => {
      setSearchOpen(false);
      if (song.playlistId) {
        setStationId(PLAYLIST_STATION_ID);
        setOpenPlaylistId(song.playlistId);
        playPlaylistTrack(song.playlistId, song.videoId);
        return;
      }
      if (!song.stationId) return;
      // Start the whole station so the radio carries on afterwards, landing on
      // the song that was actually asked for.
      const target = getStation(song.stationId);
      setStationId(target.id);
      setPickedRotation('all');
      setPlayingSource({
        stationId: target.id,
        tracks: target.tracks,
        startVideoId: song.videoId,
        playlistId: null,
      });
    },
    [playPlaylistTrack]
  );

  const openSearchPlace = useCallback(
    (place: LocalPlace) => {
      setSearchOpen(false);
      if (place.kind === 'playlist') {
        setStationId(PLAYLIST_STATION_ID);
        setOpenPlaylistId(place.id);
        return;
      }
      switchStationRef.current?.(place.id);
    },
    []
  );

  /**
   * Plays a YouTube result, then keeps going the way YouTube Music does:
   * the chosen song first, and after it an auto-radio seeded from that song.
   */
  const playYouTubeHit = useCallback((_results: YouTubeHit[], chosen: YouTubeHit) => {
    setSearchOpen(false);
    setPlayingSource({
      stationId: SEARCH_SOURCE_ID,
      // Just the song you picked — not the rest of the results. Search results
      // are ranked by how well they match your words, not sequenced as
      // listening, so the second one is as likely to be a lyric video as a
      // song you want next.
      tracks: [{ title: chosen.title, artist: chosen.author, videoId: chosen.videoId }],
      startVideoId: chosen.videoId,
      playlistId: null,
      // When it finishes, roll into YouTube's own auto-radio for that song:
      // fifty related tracks, built by the player, costing no quota at all.
      thenPlaylistId: `RD${chosen.videoId}`,
    });
  }, []);

  /** Drops a playlist, and stops it if it was the thing playing. */
  const removePlaylist = useCallback(
    async (id: string) => {
      const ok = await library.remove(id);
      if (!ok) return;
      setOpenPlaylistId((cur) => (cur === id ? null : cur));
      // Leaving the source pointed at a playlist that no longer exists would
      // keep it playing with nothing on screen able to stop it.
      setPlayingSource((cur) => (cur?.playlistId === id ? null : cur));
    },
    [library]
  );

  const handlePlayTrack = useCallback(
    (chosen: RadioTrack) => {
      if (!chosen.videoId) return;
      // Already in the live queue, so jump straight there without rebuilding.
      if (playingSource?.stationId === station.id) {
        const i = queue.findIndex((q) => q.videoId === chosen.videoId);
        if (i >= 0) {
          playAt(i);
          return;
        }
      }
      // Otherwise hand the player a new list and the song to land on.
      // startVideoId is what marks this as deliberate, so the hook loads it at
      // once rather than letting the current song play out.
      setPlayingSource({
        stationId: station.id,
        tracks,
        startVideoId: chosen.videoId,
      });
    },
    [playingSource, station.id, tracks, queue, playAt]
  );

  /**
   * Keep the playing queue in step with the rotation on screen while the
   * viewed station is the one playing. Without this the source stays frozen at
   * whatever was playing first, so the rotation chips and the hourly schedule
   * stop having any effect for anyone actually listening.
   */
  useEffect(() => {
    if (!playingSource || playingSource.stationId !== station.id) return;
    if (isPlaylistStation) return; // YouTube owns this queue, not the rotations
    if (playingSource.tracks === tracks) return;
    // No startVideoId: the listener did not ask for this, the clock turned the
    // rotation over. The song in their ears has to be allowed to finish.
    setPlayingSource({ stationId: station.id, tracks, startVideoId: null });
  }, [playingSource, station.id, tracks, isPlaylistStation]);

  /** Starts the station currently on screen, from its first playable track. */
  const playThisStation = useCallback(() => {
    // The playlist station is entered through its library, not this button.
    if (isPlaylistStation) return;
    const first = tracks.find((t) => t.videoId && !t.unplayable);
    if (first) handlePlayTrack(first);
  }, [isPlaylistStation, tracks, handlePlayTrack]);

  /** Drops a track from the catalogue file for good. */
  const removeTrack = useCallback(
    async (title: string) => {
      setSaving(true);
      setResolveMsg(null);
      try {
        const res = await fetch('/api/radio-resolve', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station: station.id, title }),
        });
        const data = await res.json();
        if (data.success) {
          setRemoved((r) => [...r, title]);
          setConfirmRemove(null);
        } else {
          setResolveMsg({ title, ok: false, text: data.error || 'Could not remove that track' });
        }
      } catch {
        setResolveMsg({ title, ok: false, text: 'Request failed. Is the dev server running?' });
      } finally {
        setSaving(false);
      }
    },
    [station.id]
  );

  // Stable handlers for the memoised drawer rows. Inline closures here would
  // give every row a new prop on every render and defeat the memo entirely.
  const openPasteFor = useCallback((title: string) => {
    setOpenPaste((cur) => (cur === title ? null : title));
    setPasteValue('');
    setResolveMsg(null);
    setConfirmRemove(null);
  }, []);

  const closePaste = useCallback(() => setOpenPaste(null), []);

  const armRemove = useCallback(
    (title: string) => {
      if (confirmRemove === title) {
        void removeTrack(title);
        return;
      }
      setConfirmRemove(title);
      setOpenPaste(null);
    },
    [confirmRemove, removeTrack]
  );

  const disarmRemove = useCallback((title: string) => {
    setConfirmRemove((c) => (c === title ? null : c));
  }, []);

  const playFromList = useCallback(
    (chosen: RadioTrack) => {
      handlePlayTrack(chosen);
      setListOpen(false);
    },
    [handlePlayTrack]
  );

  // Local clock, the small touch that makes it feel like a live broadcast.
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    tick();
    const t = setInterval(tick, 10_000);
    return () => clearInterval(t);
  }, []);

  // Keep the URL shareable without a full navigation.
  const switchStation = useCallback((id: string) => {
    // Enter from the side you came from, so a tap on "next" and a swipe left
    // produce the same motion and the set of stations feels like one strip.
    const from = allStations.findIndex((s) => s.id === stationIdRef.current);
    const to = allStations.findIndex((s) => s.id === id);
    if (from >= 0 && to >= 0 && from !== to) {
      let direction = to > from ? 1 : -1;
      // Wrapping round the ends travels the short way visually.
      if (Math.abs(to - from) === allStations.length - 1) direction = -direction;
      setEnterFrom(direction * 46);
    } else {
      setEnterFrom(0);
    }
    setStationId(id);
    setPickedRotation(null); // a new station goes back to following the clock
    setListOpen(false);
    window.history.replaceState(
      null,
      '',
      id === DEFAULT_STATION_ID ? '/radio' : `/radio?station=${id}`
    );
    try {
      window.localStorage.setItem(STATION_KEY, id);
    } catch {
      // Storage blocked or full; the station still switches for this visit.
    }
  }, []);

  // The station either side of this one, wrapping, so the phone's strip always
  // has three names and a swipe never dead-ends.
  const stationIndex = allStations.findIndex((s) => s.id === station.id);
  const prevStation = allStations[(stationIndex - 1 + allStations.length) % allStations.length];
  const nextStation = allStations[(stationIndex + 1) % allStations.length];

  /** Where a touch began, so its direction can be judged when it ends. */
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  /** Far enough that it reads as a swipe rather than a tap that wandered. */
  const SWIPE_MIN_PX = 60;
  /** When the last swipe landed, so the click it leaves behind can be dropped. */
  const swipedAtRef = useRef(0);
  /**
   * The drag is written straight to the DOM rather than held in state.
   *
   * A touchmove fires about as often as the display refreshes, and putting
   * that through React would re-render the whole page — including the nine
   * cards of the playlist library — for every frame of the gesture. Setting
   * one transform on one element is what keeps it smooth.
   */
  const dragLayerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const SETTLE = 'transform 340ms cubic-bezier(0.22, 0.68, 0.28, 1)';

  const setDragOffset = useCallback((px: number, settle: boolean) => {
    const el = dragLayerRef.current;
    if (!el) return;
    // No transition while the finger is down, or the page lags behind it.
    el.style.transition = settle ? SETTLE : 'none';
    el.style.transform = `translate3d(${px}px, 0, 0)`;
  }, []);
  /** Which side the incoming station slides in from. */
  const [enterFrom, setEnterFrom] = useState(0);
  /** Read inside stable callbacks without making them change identity. */
  const stationIdRef = useRef(stationId);
  stationIdRef.current = stationId;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = e.target as HTMLElement | null;
    // Stand aside only for things that own a drag of their own: the scrubber,
    // the volume slider, text fields, and anything that scrolls internally.
    //
    // Buttons and links are deliberately NOT in this list. The playlist
    // library is a grid of card buttons covering most of the screen, so
    // excluding them left almost nowhere to start a swipe from.
    if (el?.closest('[role="slider"], input, textarea, [data-lenis-prevent]')) {
      touchRef.current = null;
      return;
    }
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const start = touchRef.current;
    if (!start) return;
    const t = e.touches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (!draggingRef.current) {
      // Decide once what this gesture is. Below the deadzone it is still a
      // tap; more vertical than horizontal and it belongs to the scroll.
      if (Math.abs(dx) < 12) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) {
        touchRef.current = null;
        return;
      }
      draggingRef.current = true;
    }
    // Rubber band: the page follows at just over half speed and stops well
    // short of leaving, so the gesture always feels attached to something.
    const damped = Math.sign(dx) * Math.min(Math.abs(dx) * 0.55, 110);
    setDragOffset(damped, false);
  }, [setDragOffset]);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchRef.current;
      const wasDragging = draggingRef.current;
      touchRef.current = null;
      draggingRef.current = false;
      // Let go and the page eases home, whether or not it switched.
      setDragOffset(0, true);
      if (!start && !wasDragging) return;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      // Horizontal intent only: a vertical scroll must never change station.
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      swipedAtRef.current = Date.now();
      switchStation(dx < 0 ? nextStation.id : prevStation.id);
    },
    [nextStation.id, prevStation.id, switchStation, setDragOffset]
  );

  /**
   * A finger that swipes across a card still lifts over it, and the browser
   * synthesises a click from that. Without this, swiping off the playlist
   * library would change station and open a playlist on the way out.
   */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (Date.now() - swipedAtRef.current > 500) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  switchStationRef.current = switchStation;

  // Reopen on the station last listened to. A ?station= link always wins, so a
  // shared link never lands the recipient somewhere else.
  useEffect(() => {
    if (hasExplicitStation) {
      // Arrived by link rather than by clicking: still worth remembering, or
      // the playlist station is a station you can only ever reach by URL.
      try {
        window.localStorage.setItem(STATION_KEY, stationId);
      } catch {
        // Storage blocked; nothing to remember with.
      }
      return;
    }
    try {
      const saved = window.localStorage.getItem(STATION_KEY);
      if (saved && saved !== stationId && allStations.some((s) => s.id === saved)) {
        switchStation(saved);
      }
    } catch {
      // No storage available; the default station stands.
    }
    // Mount only: this restores a preference once, it does not follow changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Space to play/pause, arrows to skip, as long as focus is not in a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      // Leave focused controls alone. Otherwise Space is swallowed here and
      // never activates the focused button, and arrows fire twice on the
      // scrubber (its own handler plus this one) for a 20s jump per press.
      if (el?.closest('button, a, [role="slider"], [contenteditable="true"]')) return;
      // Arrows scrub within the song, the way every media player behaves.
      // Holding shift jumps between songs instead.
      if (e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) next();
        else skipSeconds(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) prev();
        else skipSeconds(-10);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleToggle, next, prev, skipSeconds]);

  const isPlaying = status === 'playing';

  /**
   * Keep the phone from sleeping on its own while music is playing. It cannot
   * survive a deliberate lock — see the hook — but it covers the common case
   * of a phone left face-up while the radio is on.
   */
  const wakeLock = useWakeLock(isPlaying);

  /**
   * True once the player has actually been engaged. Used to keep the compact
   * transport hidden until there is something to control, so opening the song
   * list before pressing play does not show dead buttons.
   */
  const hasStarted = status === 'playing' || status === 'paused' || status === 'loading';

  /**
   * The Paste-link / Remove editor writes to repo source files, so its API is
   * development-only. Gating the buttons on "track has no video" instead meant
   * real visitors saw editing controls that could only ever 403.
   */
  const canEditCatalogue = process.env.NODE_ENV !== 'production';

  /**
   * The next few songs in real queue order.
   *
   * The queue is shuffled per session, so the catalogue order shown in the
   * drawer says nothing about what actually plays next. Wraps around the end so
   * the list never runs dry near the tail of a rotation.
   */
  /**
   * The playlist station only has a song list once it is the thing playing:
   * the ids come out of the player, so browsing it while another station is on
   * has nothing to show.
   */
  const isPlayingThisPlaylist =
    isPlaylistStation && playingSource?.stationId === PLAYLIST_STATION_ID;

  /**
   * Any queue the player built from a playlist arrives as bare video ids and
   * needs naming — including the auto-radio a searched song rolls into, which
   * the source never names because the player entered it on its own.
   */
  const playlistVideoIds = useMemo(
    () =>
      loadedPlaylistId ? queue.map((t) => t.videoId).filter((id): id is string => !!id) : [],
    [loadedPlaylistId, queue]
  );
  const meta = useYouTubeMeta(playlistVideoIds);

  /**
   * Overlays real titles onto tracks the player only gave us ids for.
   *
   * Until the lookup lands, such a track's title IS its video id. Showing that
   * is worse than showing nothing — an 11-character string of gibberish in the
   * middle of the player — so it reads as loading instead.
   */
  const named = useCallback(
    (t: RadioTrack): RadioTrack => {
      const found = t.videoId ? meta[t.videoId] : undefined;
      if (found) return { ...t, title: found.title, artist: found.author };
      if (t.videoId && t.title === t.videoId) return { ...t, title: 'Loading…', artist: '' };
      return t;
    },
    [meta]
  );

  /** What the drawer lists: the curated rotation, or the live playlist. */
  const listTracks = useMemo(
    () => (isPlayingThisPlaylist ? queue.map(named) : tracks),
    [isPlayingThisPlaylist, queue, named, tracks]
  );

  const nowPlaying = current ? named(current) : null;
  /** The live queue with real titles, for the expanded player's list. */
  const namedQueue = useMemo(() => queue.map(named), [queue, named]);



  /**
   * The last song the bar showed.
   *
   * Moving into a playlist empties the queue while the player is rebuilt, so
   * `current` is briefly null and the bar was unmounting and sliding back in
   * — most visibly when a searched song rolls into its auto-radio. Holding the
   * outgoing song for those few hundred milliseconds keeps the bar still,
   * which is what every other player does.
   */
  const lastPlayedRef = useRef<RadioTrack | null>(null);
  if (nowPlaying) lastPlayedRef.current = nowPlaying;
  const barTrack = nowPlaying ?? lastPlayedRef.current;

  /**
   * Puts the current song on the lock screen and in Control Centre, and lets
   * the buttons there — and on headphones — drive the player.
   */
  const playPause = useCallback(() => handleToggle(), [handleToggle]);
  useMediaSession({
    title: barTrack?.title,
    artist: barTrack?.artist,
    album: barTrack?.album ?? playingStation.name,
    artwork: barTrack?.videoId ? thumbnailFor(barTrack.videoId) : null,
    isPlaying,
    active: hasStarted,
    onPlay: playPause,
    onPause: playPause,
    onNext: next,
    onPrev: prev,
  });


  /**
   * Write the playlist's songs back to the library once the player has handed
   * over its ids and the titles have resolved. This is what lets the library
   * and the track list render on a cold load, with nothing playing.
   */
  useEffect(() => {
    const id = playingSource?.playlistId;
    if (!id || queue.length === 0) return;
    // Only cache a queue that is definitely this playlist's. Without this the
    // songs of the playlist you just left get written onto the one you opened.
    if (loadedPlaylistId !== id) return;
    const resolved = queue
      .filter((t) => t.videoId)
      .map((t) => {
        const found = meta[t.videoId!];
        return {
          videoId: t.videoId!,
          title: found?.title ?? t.title,
          artist: found?.author ?? t.artist ?? '',
        };
      });
    // Titles start out as the video id; caching then would persist gibberish.
    if (resolved.length === 0 || resolved.some((t) => t.title === t.videoId)) return;
    // While shuffling, the player hands back the shuffled order. Caching that
    // would freeze one random ordering into the library for good.
    if (playlistShuffle) return;
    library.cacheTracks(id, resolved);
  }, [playingSource, queue, meta, library, playlistShuffle, loadedPlaylistId]);

  const upNext = useMemo(() => {
    if (queue.length < 2) return [];
    const count = Math.min(3, queue.length - 1);
    return Array.from({ length: count }, (_, i) => {
      const qIndex = (index + 1 + i) % queue.length;
      return { track: named(queue[qIndex]), qIndex };
    });
  }, [queue, index, named]);

  return (
    <main
      className="relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-500"
      style={
        {
          backgroundColor: station.theme.shade,
          color: station.theme.sand,
          '--accent': station.theme.accent,
          '--sand': station.theme.sand,
        } as React.CSSProperties
      }
    >
      <RadioBackdrop station={station} />


      {/* The player itself. Kept out of the layout and out of the a11y tree:
          it is an audio source, and all controls are rendered below. */}
      <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden>
        <div ref={radio.mountRef} />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* ---------- header ---------- */}
        <header className="flex items-center justify-between gap-3 px-4 pt-5 sm:px-8 sm:pt-6">
          {/* Empty, but it still holds one side of the header: the segmented
              control is centred by equal weight either side of it. */}
          <span className="md:flex-1" aria-hidden />

          {/* ---------- station switcher, wide screens ---------- */}
          {/* In the header rather than the hero so it never scrolls away, and
              so the page below it is nothing but the station you chose. On
              narrow screens five segments do not fit, and the docked pill row
              at the bottom of the page takes over instead. */}
          <div
            className="hidden shrink-0 items-center gap-[3px] rounded-full border p-1 md:inline-flex"
            style={{
              borderColor: `${station.theme.sand}18`,
              backgroundColor: `${station.theme.sand}12`,
            }}
          >
            {allStations.map((s) => {
              const active = s.id === station.id;
              return (
                <button
                  key={s.id}
                  onClick={() => switchStation(s.id)}
                  aria-current={active ? 'true' : undefined}
                  className="rounded-full px-4 py-1.5 text-xs transition-all"
                  style={{
                    // The active segment wears its OWN station's accent, so the
                    // control carries the colour of the place it sends you.
                    backgroundColor: active ? s.theme.accent : 'transparent',
                    color: active ? s.theme.shade : station.theme.sand,
                    fontWeight: active ? 600 : 400,
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm md:flex-1 md:justify-end">
            {/* The palette's visible door. Without it the whole feature is a
                keyboard shortcut nobody knows about. */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search music"
              title="Search music"
              className="mr-1 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ backgroundColor: station.theme.accent }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: station.theme.accent }}
              />
            </span>
            <span className="font-semibold tabular-nums">
              {presence === null ? '—' : presence.station}
            </span>
            {/* Name the station whenever it is not the one on screen, so the
                count is never read as belonging to what you are looking at. */}
            <span className="opacity-70">
              {isBrowsingElsewhere ? `on ${playingStation.name}` : 'listening'}
            </span>
            <span className="ml-2 hidden font-mono tabular-nums opacity-70 md:inline">{clock}</span>
          </div>

          {/* Below md the clock keeps its own place on the right; from md up it
              joins the presence group so the centre is free for the switcher. */}
          <span className="min-w-[4.5rem] text-right font-mono text-xs tabular-nums opacity-70 sm:text-sm md:hidden">
            {clock}
          </span>
        </header>

        {/* ---------- station strip, narrow screens ---------- */}
        {/* Names either side of the current one, in their own colours, so a
            swipe tells you where it will land before you make it. Tappable
            too, so nothing here depends on discovering the gesture. */}
        <div className="flex items-center justify-center gap-3 px-4 pt-4 md:hidden">
          <button
            onClick={() => switchStation(prevStation.id)}
            className="min-w-0 shrink truncate text-[0.7rem] opacity-45 transition-opacity hover:opacity-80"
            style={{ color: prevStation.theme.accent }}
          >
            ‹ {prevStation.shortName ?? prevStation.name}
          </button>

          <span
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: station.theme.accent, color: station.theme.shade }}
          >
            {station.name}
          </span>

          <button
            onClick={() => switchStation(nextStation.id)}
            className="min-w-0 shrink truncate text-[0.7rem] opacity-45 transition-opacity hover:opacity-80"
            style={{ color: nextStation.theme.accent }}
          >
            {nextStation.shortName ?? nextStation.name} ›
          </button>
        </div>

        {/* ---------- now playing ---------- */}
        {/* The drag layer follows the finger; the station inside it settles
            into place when the finger lets go. Two layers, because one element
            cannot both track a gesture and run an entrance at the same time. */}
        <div
          ref={dragLayerRef}
          className="flex flex-1 flex-col"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClickCapture={onClickCapture}
          style={{
            transform: 'translate3d(0, 0, 0)',
            transition: SETTLE,
            willChange: 'transform',
            // Vertical scrolling stays the browser's; horizontal is ours.
            touchAction: 'pan-y',
          }}
        >
        <motion.section
          key={station.id}
          initial={{ opacity: 0, x: enterFrom }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 330, damping: 34, mass: 0.7 }}
          className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          {/* The playlist station is its own thing: a library of saved
              playlists that opens into one, rather than a rotation with a
              transport. Everything it shows comes from the cached tracks, so
              it paints on load without the player existing — and it shows even
              while another station is playing, since browsing your library is
              no reason to stop the music. */}
          {isPlaylistStation ? (
            <PlaylistLibrary
              playlists={library.playlists}
              loaded={library.loaded}
              busy={library.busy}
              serverError={library.error}
              theme={station.theme}
              openId={openPlaylistId}
              nowPlayingVideoId={current?.videoId ?? null}
              isPlayingThis={playingSource?.playlistId === openPlaylistId}
              shuffle={playlistShuffle}
              onOpen={setOpenPlaylistId}
              onBack={backToLibrary}
              onAdd={library.add}
              onRemove={removePlaylist}
              onRename={library.setName}
              onPlayPlaylist={playPlaylist}
              onPlayTrack={playPlaylistTrack}
              onToggleShuffle={togglePlaylistShuffle}
            />
          ) : (
            <>
            {/* Rotation picker. The scheduled one is on air unless you pick. */}
            {station.rotations && station.rotations.length > 0 && (
              <div className="mb-6 flex max-w-2xl flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {station.rotations.map((r) => {
                    const active = r.id === activeRotationId;
                    const onAir = r.id === scheduled;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setPickedRotation(r.id === pickedRotation ? null : r.id)}
                        aria-pressed={active}
                        title={`${r.description} · ${counts[r.id] ?? 0} songs`}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] transition-all sm:text-xs"
                        style={{
                          borderColor: active ? station.theme.accent : `${station.theme.sand}25`,
                          backgroundColor: active ? `${station.theme.accent}22` : 'transparent',
                          color: station.theme.sand,
                          opacity: active ? 1 : 0.6,
                        }}
                      >
                        {onAir && (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: station.theme.accent }}
                            aria-hidden
                          />
                        )}
                        {r.name}
                        <span className="tabular-nums opacity-50">{counts[r.id] ?? 0}</span>
                      </button>
                    );
                  })}

                  {/* The whole station. No clock slot ever covers everything, so
                      without this chip most of the catalogue is unreachable. */}
                  <button
                    onClick={() => setPickedRotation(pickedRotation === 'all' ? null : 'all')}
                    aria-pressed={pickedRotation === 'all'}
                    title={`Every song on ${station.name}, ignoring the clock`}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] transition-all sm:text-xs"
                    style={{
                      borderColor:
                        pickedRotation === 'all' ? station.theme.accent : `${station.theme.sand}25`,
                      backgroundColor:
                        pickedRotation === 'all' ? `${station.theme.accent}22` : 'transparent',
                      color: station.theme.sand,
                      opacity: pickedRotation === 'all' ? 1 : 0.6,
                    }}
                  >
                    All songs
                    <span className="tabular-nums opacity-50">{station.tracks.length}</span>
                  </button>
                </div>
                <p className="max-w-md text-balance text-[0.7rem] leading-relaxed opacity-50">
                  {pickedRotation === 'all'
                    ? station.description
                    : activeRotation
                      ? pickedRotation
                        ? activeRotation.description
                        : `On air now · ${activeRotation.description}`
                      : station.tagline}
                </p>
              </div>
            )}

            {station.script && (
              <p
                className="mb-3 text-4xl font-bold opacity-25 sm:text-6xl"
                style={{ color: station.theme.accent }}
              >
                {station.script}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={current?.videoId ?? `${station.id}-empty`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="max-w-2xl"
              >
                {status === 'empty' && !isPlaylistStation ? (
                  <>
                    <h1 className="text-balance text-2xl font-bold sm:text-4xl">
                      This station has no resolved tracks yet
                    </h1>
                    <p className="mt-3 text-sm opacity-70">
                      Run the resolver to fill in video ids, then reload.
                    </p>
                  </>
                ) : isBrowsingElsewhere ? (
                  /* Browsing a station that is not the one playing. Showing the
                     playing track here would attach another station's song to
                     this station's name and artwork, so show what you are
                     actually looking at and offer to start it. The playing track
                     lives in the bar at the bottom instead. */
                  <>
                    <h1 className="text-balance text-3xl font-bold leading-tight sm:text-5xl">
                      {station.name}
                    </h1>
                    <p className="mt-3 text-base opacity-80 sm:text-lg">{station.tagline}</p>
                    <p className="mt-1 font-mono text-xs opacity-55 sm:text-sm">
                      {playableCount} songs ready
                    </p>
                    <button
                      onClick={playThisStation}
                      disabled={playableCount === 0}
                      className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                      style={{ backgroundColor: station.theme.accent, color: station.theme.shade }}
                    >
                      <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
                      Play {station.name}
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="text-balance text-3xl font-bold leading-tight sm:text-5xl">
                      {nowPlaying?.title ?? 'Pull up a chair'}
                    </h1>
                    <p className="mt-3 text-base opacity-80 sm:text-lg">
                      {nowPlaying?.artist ?? station.tagline}
                    </p>
                    {(nowPlaying?.album || nowPlaying?.year) && (
                      <p className="mt-1 font-mono text-xs opacity-55 sm:text-sm">
                        {[nowPlaying.album, nowPlaying.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* A run of failures, rather than the one dead upload the player
                skips silently. Almost always region blocking, so say that
                instead of leaving the listener in front of a silent radio. */}
            {stalled && !isBrowsingElsewhere && (
              <div
                className="mt-6 flex w-full max-w-md items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs"
                style={{ borderColor: '#ff808055', color: '#ffb3b3' }}
                role="status"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">
                  Several songs in a row would not play. YouTube may be blocking them where you
                  are.
                </span>
                <button
                  onClick={retry}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 transition-colors hover:bg-white/10"
                  style={{ borderColor: '#ff808055' }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}

            {/* progress */}
            {status !== 'empty' && !isBrowsingElsewhere && (
              <div className="mt-8 w-full max-w-md">
                <Scrubber
                  label="Seek within the current song"
                  progress={progress}
                  onSeekFraction={seekToFraction}
                  onSkipSeconds={skipSeconds}
                  className="group -my-3 cursor-pointer py-3 focus:outline-none"
                  trackClassName="h-1 w-full overflow-hidden rounded-full transition-all group-hover:h-1.5 group-focus-visible:h-1.5"
                  trackColor={`${station.theme.sand}22`}
                  fillColor={station.theme.accent}
                />
                <div className="mt-2 flex justify-between font-mono text-[0.7rem] tabular-nums opacity-60">
                  <span>{formatTime(progress.current)}</span>
                  <span>
                    {status === 'loading'
                      ? 'buffering…'
                      : queue.length > 0
                        ? `${index + 1} / ${queue.length}`
                        : ''}
                  </span>
                  <span>{formatTime(progress.duration)}</span>
                </div>
              </div>
            )}

            {/* transport */}
            {!isBrowsingElsewhere && (
            <div className="mt-8 flex items-center gap-5">
              <button
                onClick={prev}
                disabled={status === 'empty'}
                aria-label="Previous song"
                className="rounded-full p-3 opacity-75 transition hover:opacity-100 disabled:opacity-25"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={handleToggle}
                disabled={status === 'empty'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="rounded-full p-5 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-25"
                style={{ backgroundColor: station.theme.accent, color: station.theme.shade }}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" fill="currentColor" />
                ) : (
                  <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
                )}
              </button>

              <button
                onClick={next}
                disabled={status === 'empty'}
                aria-label="Next song"
                className="rounded-full p-3 opacity-75 transition hover:opacity-100 disabled:opacity-25"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            )}

            {/* volume + track list */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <label className="flex items-center gap-2 text-xs opacity-70">
                <Volume2 className="h-4 w-4" />
                <span className="sr-only">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="radio-volume h-1 w-24 cursor-pointer rounded-full"
                  style={
                    {
                      background: `linear-gradient(to right, ${station.theme.accent} ${volume}%, ${station.theme.sand}22 ${volume}%)`,
                      '--slider-thumb': station.theme.accent,
                    } as React.CSSProperties
                  }
                />
              </label>

              <button
                onClick={() => setListOpen(true)}
                className="inline-flex items-center gap-2 text-xs opacity-70 transition-opacity hover:opacity-100"
              >
                <ListMusic className="h-4 w-4" />
                {/* The playable count, not the catalogue count: this opens the
                    list, and the list can only show tracks that have a resolved
                    video id. Counting unresolved entries here made the button
                    disagree with the drawer it opens. */}
                {playableCount} songs
              </button>

              {/* Only shown once the lock is actually held, so it reports a fact
                  rather than an intention. The title says what it cannot do,
                  since "screen staying on" invites exactly the wrong assumption. */}
              {wakeLock.held && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem]"
                  style={{
                    borderColor: `${station.theme.accent}55`,
                    color: station.theme.accent,
                  }}
                  title="Your phone will not dim or sleep by itself while the radio plays. Locking it yourself still stops the music: YouTube does not allow embedded players to keep playing in the background."
                >
                  <Sun className="h-3 w-3" />
                  Screen staying on
                </span>
              )}
            </div>

            {/* Up next, on the main page so the choice is visible without
                opening the list. Shows real queue order, which the drawer's
                catalogue order cannot convey once the queue is shuffled. */}
            {hasStarted && !isBrowsingElsewhere && upNext.length > 0 && (
              <div className="mt-10 w-full max-w-md text-left">
                <p className="mb-2 text-[0.6rem] uppercase tracking-[0.25em] opacity-40">Up next</p>
                <ul className="space-y-0.5">
                  {upNext.map(({ track, qIndex }, i) => (
                    <li key={`${track.videoId}-${qIndex}`}>
                      <button
                        onClick={() => playAt(qIndex)}
                        className="group flex w-full items-baseline gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span
                          className="w-3 shrink-0 self-center font-mono text-[0.65rem] opacity-30"
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <Thumb
                          videoId={track.videoId}
                          sand={station.theme.sand}
                          className="h-7 w-12 self-center"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm opacity-80 transition-opacity group-hover:opacity-100">
                            {track.title}
                          </span>
                          <span className="block truncate text-[0.7rem] opacity-45">
                            {[track.artist, track.album].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <span
                          className="shrink-0 text-[0.6rem] uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-60"
                          aria-hidden
                        >
                          play
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </>
          )}
        </motion.section>
        </div>

        {/* Spacer so the station switcher clears the fixed now-playing bar. */}
        <div aria-hidden style={{ height: hasStarted ? '4.5rem' : '1.5rem' }} />
      </div>

      {/* ---------- now-playing bar ---------- */}
      {/* Page level rather than inside the drawer, so whatever is playing stays
          reachable while browsing any station. Themed by the station that owns
          the audio, not the one on screen, so the colour never lies about the
          source. Sits above the drawer (z-60 vs z-50) to stay usable. */}
      {hasStarted && barTrack && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t backdrop-blur-md"
          style={{
            backgroundColor: `${playingStation.theme.shade}f2`,
            borderColor: `${playingStation.theme.sand}20`,
            color: playingStation.theme.sand,
          }}
        >
          {/* Scrubber along the top edge of the bar. The hit area is padded
              well beyond the 2px line so it can actually be grabbed, and the
              padding hangs downward since there is nothing above a bar pinned
              to the bottom of the viewport. */}
          <Scrubber
            label="Seek within the current song, mini player"
            progress={progress}
            onSeekFraction={seekToFraction}
            onSkipSeconds={skipSeconds}
            className="group absolute inset-x-0 top-0 z-10 cursor-pointer pb-3 focus:outline-none"
            trackClassName="h-0.5 w-full transition-all group-hover:h-1.5 group-focus-visible:h-1.5"
            trackColor={`${playingStation.theme.sand}18`}
            fillColor={playingStation.theme.accent}
            fillClassName="h-full transition-[width] duration-500 ease-linear"
          />

          {/* Tapping the bar opens the full player, the way a music app does.
              The transport inside stops the click so the buttons still just
              play, pause and skip. */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open player and queue"
            onClick={() => setSheetOpen(true)}
            onTouchStart={onBarTouchStart}
            onTouchEnd={onBarTouchEnd}
            onClickCapture={onBarClickCapture}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSheetOpen(true);
              }
            }}
            className="mx-auto flex max-w-4xl cursor-pointer items-center gap-3 px-4 py-2.5 sm:px-6">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              {isPlaying && (
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                  style={{ backgroundColor: playingStation.theme.accent }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isPlaying
                    ? playingStation.theme.accent
                    : `${playingStation.theme.sand}50`,
                }}
              />
            </span>

            <Thumb
              videoId={barTrack.videoId}
              sand={playingStation.theme.sand}
              className="hidden h-8 w-14 sm:block"
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{barTrack.title}</span>
              <span className="block truncate text-xs opacity-60">
                {isSearchSource ? (
                  // No station to send anyone to, so this is a label, not a link.
                  [barTrack.artist, 'From search'].filter(Boolean).join(' · ')
                ) : isBrowsingElsewhere ? (
                  <>
                    {barTrack.artist ? `${barTrack.artist} · ` : ''}
                    <button
                      onClick={() => switchStation(playingStation.id)}
                      className="underline underline-offset-2"
                    >
                      {playingStation.name}
                    </button>
                  </>
                ) : (
                  [barTrack.artist, barTrack.album].filter(Boolean).join(' · ')
                )}
              </span>
            </span>

            <span className="hidden shrink-0 font-mono text-[0.7rem] tabular-nums opacity-50 sm:inline">
              {formatTime(progress.current)} / {formatTime(progress.duration)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous song"
              className="shrink-0 rounded-full p-3.5 opacity-70 transition-opacity hover:opacity-100 sm:p-2"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="shrink-0 rounded-full p-3.5 transition-transform hover:scale-105 active:scale-95 sm:p-2.5"
              style={{
                backgroundColor: playingStation.theme.accent,
                color: playingStation.theme.shade,
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 translate-x-px sm:h-4 sm:w-4" fill="currentColor" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next song"
              className="shrink-0 rounded-full p-3.5 opacity-70 transition-opacity hover:opacity-100 sm:p-2"
            >
              <SkipForward className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {sheetOpen && (
          <NowPlayingSheet
            open={sheetOpen}
            theme={playingStation.theme}
            current={barTrack}
            queue={namedQueue}
            index={index}
            isPlaying={isPlaying}
            progress={progress}
            sourceLabel={isSearchSource ? 'From search' : playingStation.name}
            onClose={() => setSheetOpen(false)}
            onToggle={handleToggle}
            onNext={next}
            onPrev={prev}
            onPlayAt={playAt}
            onReorder={reorderQueue}
            onSeekFraction={seekToFraction}
            onSkipSeconds={skipSeconds}
          />
        )}
      </AnimatePresence>

      <SearchPalette
        open={searchOpen}
        theme={station.theme}
        songs={searchSongs}
        places={searchPlaces}
        onClose={() => setSearchOpen(false)}
        onPlaySong={playSearchSong}
        onOpenPlace={openSearchPlace}
        onPlayYouTube={playYouTubeHit}
      />

      {/* ---------- track list drawer ---------- */}
      <AnimatePresence>
        {listOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            style={{
              backgroundColor: '#000000aa',
              paddingBottom: hasStarted ? '4.25rem' : undefined,
            }}
            onClick={() => setListOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[80dvh] w-full max-w-2xl flex-col rounded-t-2xl border sm:rounded-2xl"
              style={{
                backgroundColor: station.theme.shade,
                borderColor: `${station.theme.sand}22`,
                color: station.theme.sand,
              }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: `${station.theme.sand}18` }}
              >
                <div>
                  <h2 className="font-semibold">
                    {activeRotation ? activeRotation.name : station.name}
                  </h2>
                  <p className="text-xs opacity-60">
                    {activeRotation ? activeRotation.description : station.description}
                  </p>
                </div>
                <button
                  onClick={() => setListOpen(false)}
                  aria-label="Close song list"
                  className="rounded-full p-2 opacity-70 hover:opacity-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* min-h-0 is required: a flex child defaults to min-height:auto,
                  which refuses to shrink below its content, so the list grows
                  past the drawer instead of scrolling inside it. */}
              <ul
                data-lenis-prevent
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
              >
                {/* Every track in the rotation, playable or not. Missing ones
                    stay visible so they can be filled in from here rather than
                    silently disappearing from the catalogue. */}
                {listTracks
                  .filter((t) => !removed.includes(t.title))
                  .map((t, ti) => {
                    // Playable means the track has a resolved video, full stop.
                    // Checking the live queue instead would mark every track of
                    // a browsed-but-not-playing station as missing.
                    const playable = !!t.videoId;
                    return (
                      <TrackRow
                        key={`${t.title}-${ti}`}
                        track={t}
                        position={ti + 1}
                        playable={playable}
                        isNow={!isBrowsingElsewhere && playable && current?.videoId === t.videoId}
                        accent={station.theme.accent}
                        sand={station.theme.sand}
                        shade={station.theme.shade}
                        canEdit={canEditCatalogue}
                        pasteOpen={openPaste === t.title}
                        pasteValue={openPaste === t.title ? pasteValue : ''}
                        saving={saving}
                        confirmingRemove={confirmRemove === t.title}
                        message={resolveMsg?.title === t.title ? resolveMsg : null}
                        onPlay={playFromList}
                        onTogglePaste={openPasteFor}
                        onPasteChange={setPasteValue}
                        onSubmitPaste={submitPaste}
                        onClosePaste={closePaste}
                        onArmRemove={armRemove}
                        onDisarmRemove={disarmRemove}
                      />
                    );
                  })}
                {listTracks.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm opacity-60">
                    {isPlaylistStation
                      ? 'Open a playlist from the library to see its songs.'
                      : 'Nothing in this rotation yet.'}
                  </li>
                )}
              </ul>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

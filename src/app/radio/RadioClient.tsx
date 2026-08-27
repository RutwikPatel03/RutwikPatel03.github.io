'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  X,
  ArrowLeft,
  Radio as RadioIcon,
  Search,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  stations,
  getStation,
  rotationForNow,
  tracksForRotation,
  rotationCounts,
} from '@/data/radio';
import type { RotationId, RadioTrack } from '@/types/radio';
import { usePresence } from '@/hooks/usePresence';
import { useYouTubeRadio } from '@/hooks/useYouTubeRadio';
import { RadioBackdrop } from './RadioBackdrop';
import { track } from '@/lib/analytics-client';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RadioClient({ initialStationId }: { initialStationId: string }) {
  const [stationId, setStationId] = useState(initialStationId);
  const [listOpen, setListOpen] = useState(false);
  const [clock, setClock] = useState('');
  /** null means "follow the clock"; a value means the listener picked one. */
  const [pickedRotation, setPickedRotation] = useState<RotationId | null>(null);

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
  const presence = usePresence(stationId);

  // Which rotation is scheduled right now, recomputed as the hour turns.
  const [scheduled, setScheduled] = useState(() => rotationForNow(station)?.id ?? null);
  useEffect(() => {
    const sync = () => setScheduled(rotationForNow(station)?.id ?? null);
    sync();
    const t = setInterval(sync, 60_000);
    return () => clearInterval(t);
  }, [station]);

  const activeRotationId = pickedRotation ?? scheduled;
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
  const [playingSource, setPlayingSource] = useState<{
    stationId: string;
    tracks: RadioTrack[];
  } | null>(null);

  /** Track to jump to once a newly picked station's queue has loaded. */
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  const radio = useYouTubeRadio(playingSource?.tracks ?? tracks);

  const playingStation = playingSource ? getStation(playingSource.stationId) : station;
  const isBrowsingElsewhere = !!playingSource && playingSource.stationId !== station.id;
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
    toggle,
    next,
    prev,
    playAt,
    volume,
    setVolume,
    seekToFraction,
    skipSeconds,
  } = radio;

  /**
   * Sends a pasted YouTube link to the dev-only API, which verifies the video
   * really exists and is playable before writing it into the data file.
   */
  const submitPaste = useCallback(
    async (title: string) => {
      if (!pasteValue.trim()) return;
      setSaving(true);
      setResolveMsg(null);
      try {
        const res = await fetch('/api/radio-resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station: station.id, title, url: pasteValue }),
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
    [pasteValue, station.id]
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
    if (!playingSource) {
      setPlayingSource({ stationId: station.id, tracks });
    }
    toggle();
  }, [playingSource, station.id, tracks, toggle]);

  /**
   * Picking a song out of the list. If it belongs to a station other than the
   * one playing, switch the source across and remember which track to land on
   * once that queue has been built.
   */
  const handlePlayTrack = useCallback(
    (track: RadioTrack) => {
      if (!track.videoId) return;
      const sameSource = playingSource?.stationId === station.id;
      if (!playingSource || !sameSource) {
        setPlayingSource({ stationId: station.id, tracks });
        setPendingVideoId(track.videoId);
        return;
      }
      const i = queue.findIndex((q) => q.videoId === track.videoId);
      if (i >= 0) {
        playAt(i);
        return;
      }
      // Same station but a different rotation, so the track is not in the live
      // queue. Rebuild from the rotation on screen and land on it, rather than
      // silently doing nothing.
      setPlayingSource({ stationId: station.id, tracks });
      setPendingVideoId(track.videoId);
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
    if (playingSource.tracks === tracks) return;
    setPlayingSource({ stationId: station.id, tracks });
  }, [playingSource, station.id, tracks]);

  /** Starts the station currently on screen, from its first playable track. */
  const playThisStation = useCallback(() => {
    const first = tracks.find((t) => t.videoId && !t.unplayable);
    if (first) handlePlayTrack(first);
  }, [tracks, handlePlayTrack]);

  // Land on the requested track once the newly picked station's queue exists.
  useEffect(() => {
    if (!pendingVideoId) return;
    const i = queue.findIndex((q) => q.videoId === pendingVideoId);
    if (i >= 0) {
      playAt(i);
      setPendingVideoId(null);
    }
  }, [pendingVideoId, queue, playAt]);

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

  /** Maps a pointer position on the progress bar to a 0-1 fraction. */
  const seekFromPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      seekToFraction((e.clientX - rect.left) / rect.width);
    },
    [seekToFraction]
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
    setStationId(id);
    setPickedRotation(null); // a new station goes back to following the clock
    setListOpen(false);
    window.history.replaceState(null, '', id === 'saloon' ? '/radio' : `/radio?station=${id}`);
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

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;
  const isPlaying = status === 'playing';
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
  const upNext = useMemo(() => {
    if (queue.length < 2) return [];
    const count = Math.min(3, queue.length - 1);
    return Array.from({ length: count }, (_, i) => {
      const qIndex = (index + 1 + i) % queue.length;
      return { track: queue[qIndex], qIndex };
    });
  }, [queue, index]);

  return (
    <main
      className="relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-700"
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs opacity-70 transition-opacity hover:opacity-100 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">rutwik.dev</span>
          </Link>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
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
            <span className="opacity-70">listening</span>
          </div>

          <span className="min-w-[4.5rem] text-right font-mono text-xs tabular-nums opacity-70 sm:text-sm">
            {clock}
          </span>
        </header>

        {/* ---------- now playing ---------- */}
        <section className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] sm:text-xs"
            style={{ borderColor: `${station.theme.accent}55` }}
          >
            <RadioIcon className="h-3 w-3" />
            {station.name}
          </div>

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
              </div>
              <p className="max-w-md text-balance text-[0.7rem] leading-relaxed opacity-50">
                {activeRotation
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
              {status === 'empty' ? (
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
                    {current?.title ?? 'Pull up a chair'}
                  </h1>
                  <p className="mt-3 text-base opacity-80 sm:text-lg">
                    {current?.artist ?? station.tagline}
                  </p>
                  {(current?.album || current?.year) && (
                    <p className="mt-1 font-mono text-xs opacity-55 sm:text-sm">
                      {[current.album, current.year].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* progress */}
          {status !== 'empty' && !isBrowsingElsewhere && (
            <div className="mt-8 w-full max-w-md">
              {/* Scrubber. Hit area is deliberately taller than the visible
                  bar so it is grabbable on touch without a chunky track. */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Seek within the current song"
                aria-valuemin={0}
                aria-valuemax={Math.round(progress.duration) || 0}
                aria-valuenow={Math.round(progress.current) || 0}
                aria-valuetext={`${formatTime(progress.current)} of ${formatTime(progress.duration)}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  seekFromPointer(e);
                }}
                onPointerMove={(e) => {
                  // Only scrub while the pointer is actually held down.
                  if (e.buttons === 1) seekFromPointer(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    skipSeconds(10);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    skipSeconds(-10);
                  }
                }}
                className="group -my-3 cursor-pointer py-3 focus:outline-none"
              >
                <div
                  className="h-1 w-full overflow-hidden rounded-full transition-all group-hover:h-1.5 group-focus-visible:h-1.5"
                  style={{ backgroundColor: `${station.theme.sand}22` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: station.theme.accent }}
                  />
                </div>
              </div>
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
          <div className="mt-7 flex items-center gap-5">
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
                        className="w-3 shrink-0 font-mono text-[0.65rem] opacity-30"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
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
        </section>

        {/* ---------- station switcher ---------- */}
        <nav className="px-4 pb-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {stations.map((s) => {
              const active = s.id === station.id;
              return (
                <button
                  key={s.id}
                  onClick={() => switchStation(s.id)}
                  aria-current={active ? 'true' : undefined}
                  className="rounded-full border px-3.5 py-2 text-xs transition-all sm:text-sm"
                  style={{
                    borderColor: active ? s.theme.accent : `${station.theme.sand}30`,
                    backgroundColor: active ? s.theme.accent : 'transparent',
                    color: active ? station.theme.shade : station.theme.sand,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Spacer so the station switcher clears the fixed now-playing bar. */}
        <div aria-hidden style={{ height: hasStarted ? '4.5rem' : '1.5rem' }} />
      </div>

      {/* ---------- now-playing bar ---------- */}
      {/* Page level rather than inside the drawer, so whatever is playing stays
          reachable while browsing any station. Themed by the station that owns
          the audio, not the one on screen, so the colour never lies about the
          source. Sits above the drawer (z-60 vs z-50) to stay usable. */}
      {hasStarted && current && (
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
          <div
            role="slider"
            tabIndex={0}
            aria-label="Seek within the current song"
            aria-valuemin={0}
            aria-valuemax={Math.round(progress.duration) || 0}
            aria-valuenow={Math.round(progress.current) || 0}
            aria-valuetext={`${formatTime(progress.current)} of ${formatTime(progress.duration)}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromPointer(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) seekFromPointer(e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                skipSeconds(10);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                skipSeconds(-10);
              }
            }}
            className="group absolute inset-x-0 top-0 z-10 cursor-pointer pb-3 focus:outline-none"
          >
            <div
              className="h-0.5 w-full transition-all group-hover:h-1.5 group-focus-visible:h-1.5"
              style={{ backgroundColor: `${playingStation.theme.sand}18` }}
            >
              <div
                className="h-full transition-[width] duration-500 ease-linear"
                style={{ width: `${pct}%`, backgroundColor: playingStation.theme.accent }}
              />
            </div>
          </div>

          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2.5 sm:px-6">
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

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{current.title}</span>
              <span className="block truncate text-xs opacity-60">
                {isBrowsingElsewhere ? (
                  <>
                    {current.artist ? `${current.artist} · ` : ''}
                    <button
                      onClick={() => switchStation(playingStation.id)}
                      className="underline underline-offset-2"
                    >
                      {playingStation.name}
                    </button>
                  </>
                ) : (
                  [current.artist, current.album].filter(Boolean).join(' · ')
                )}
              </span>
            </span>

            <span className="hidden shrink-0 font-mono text-[0.7rem] tabular-nums opacity-50 sm:inline">
              {formatTime(progress.current)} / {formatTime(progress.duration)}
            </span>

            <button
              onClick={prev}
              aria-label="Previous song"
              className="shrink-0 rounded-full p-2 opacity-70 transition-opacity hover:opacity-100"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="shrink-0 rounded-full p-2.5 transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: playingStation.theme.accent,
                color: playingStation.theme.shade,
              }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
              )}
            </button>
            <button
              onClick={next}
              aria-label="Next song"
              className="shrink-0 rounded-full p-2 opacity-70 transition-opacity hover:opacity-100"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

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
                {tracks.filter((t) => !removed.includes(t.title)).map((t, ti) => {
                  // Playable means the track has a resolved video, full stop.
                  // Checking the live queue instead would mark every track of a
                  // browsed-but-not-playing station as missing.
                  const playable = !!t.videoId;
                  const isNow =
                    !isBrowsingElsewhere && playable && current?.videoId === t.videoId;
                  const msg = resolveMsg?.title === t.title ? resolveMsg : null;
                  const query = [t.title, (t.artist || '').split(',')[0], t.album, 'official song']
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <li key={`${t.title}-${ti}`}>
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                        style={isNow ? { backgroundColor: `${station.theme.accent}1f` } : undefined}
                      >
                        <span className="w-6 shrink-0 font-mono text-xs opacity-40">{ti + 1}</span>

                        <button
                          onClick={() => {
                            if (!playable) return;
                            handlePlayTrack(t);
                            setListOpen(false);
                          }}
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
                            style={{ color: station.theme.accent }}
                          >
                            now
                          </span>
                        )}

                        {!playable && canEditCatalogue && (
                          <>
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              title="Search YouTube for this song"
                              className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10"
                              style={{ borderColor: `${station.theme.sand}30` }}
                            >
                              <Search className="h-3 w-3" />
                              Search
                            </a>
                            <button
                              onClick={() => {
                                setOpenPaste(openPaste === t.title ? null : t.title);
                                setPasteValue('');
                                setResolveMsg(null);
                                setConfirmRemove(null);
                              }}
                              className="shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10"
                              style={{
                                borderColor:
                                  openPaste === t.title
                                    ? station.theme.accent
                                    : `${station.theme.sand}30`,
                              }}
                            >
                              Paste link
                            </button>
                            {/* Two-step: arming first means a stray click cannot
                                delete a track from the source file. */}
                            <button
                              onClick={() => {
                                if (confirmRemove === t.title) void removeTrack(t.title);
                                else {
                                  setConfirmRemove(t.title);
                                  setOpenPaste(null);
                                }
                              }}
                              onBlur={() =>
                                setConfirmRemove((c) => (c === t.title ? null : c))
                              }
                              disabled={saving}
                              title="Remove this song from the catalogue"
                              className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors hover:bg-white/10 disabled:opacity-40"
                              style={
                                confirmRemove === t.title
                                  ? { borderColor: '#ff8080', color: '#ff8080' }
                                  : { borderColor: `${station.theme.sand}30` }
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                              {confirmRemove === t.title ? 'Sure?' : 'Remove'}
                            </button>
                          </>
                        )}
                      </div>

                      {openPaste === t.title && canEditCatalogue && (
                        <div className="flex items-center gap-2 px-3 pb-3 pl-11">
                          <input
                            autoFocus
                            value={pasteValue}
                            onChange={(e) => setPasteValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void submitPaste(t.title);
                              if (e.key === 'Escape') setOpenPaste(null);
                            }}
                            placeholder="Paste the YouTube link here"
                            className="min-w-0 flex-1 rounded-md border bg-transparent px-2.5 py-1.5 text-xs outline-none"
                            style={{
                              borderColor: `${station.theme.sand}30`,
                              color: station.theme.sand,
                            }}
                          />
                          <button
                            onClick={() => void submitPaste(t.title)}
                            disabled={saving || !pasteValue.trim()}
                            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                            style={{
                              backgroundColor: station.theme.accent,
                              color: station.theme.shade,
                            }}
                          >
                            {saving ? 'Checking…' : 'Save'}
                          </button>
                        </div>
                      )}

                      {msg && (
                        <p
                          className="flex items-start gap-1.5 px-3 pb-2 pl-11 text-[0.7rem]"
                          style={{ color: msg.ok ? station.theme.accent : '#ff8080' }}
                        >
                          {msg.ok ? (
                            <Check className="mt-px h-3 w-3 shrink-0" />
                          ) : (
                            <AlertCircle className="mt-px h-3 w-3 shrink-0" />
                          )}
                          {msg.text}
                        </p>
                      )}
                    </li>
                  );
                })}
                {tracks.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm opacity-60">
                    Nothing in this rotation yet.
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

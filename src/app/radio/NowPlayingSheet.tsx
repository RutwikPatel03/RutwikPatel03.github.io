'use client';

import { useEffect, useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { ChevronDown, GripVertical, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { RadioTrack } from '@/types/radio';

interface Theme {
  shade: string;
  sand: string;
  accent: string;
}

function thumbnailFor(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** A queue row carries a stable key of its own, since titles repeat. */
interface QueueRow {
  key: string;
  track: RadioTrack;
  index: number;
}

/**
 * The expanded player: what is on, what is coming, and the order it comes in.
 *
 * Opened by tapping the bar at the bottom, the way a music app does. The
 * queue is the real playback order, not the catalogue, and dragging a row
 * changes what actually plays next.
 */
export function NowPlayingSheet({
  open,
  theme,
  current,
  queue,
  index,
  isPlaying,
  progress,
  sourceLabel,
  onClose,
  onToggle,
  onNext,
  onPrev,
  onPlayAt,
  onReorder,
}: {
  open: boolean;
  theme: Theme;
  current: RadioTrack | null;
  queue: RadioTrack[];
  index: number;
  isPlaying: boolean;
  progress: { current: number; duration: number };
  sourceLabel: string;
  onClose: () => void;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayAt: (index: number) => void;
  onReorder: (nextQueue: RadioTrack[], nextIndex: number) => void;
}) {
  /**
   * A local copy so a drag is smooth: committing every intermediate order to
   * the player would fight the gesture. It is pushed up when the drag ends.
   */
  const [rows, setRows] = useState<QueueRow[]>([]);

  // The upcoming songs, in real playback order, wrapping past the end.
  useEffect(() => {
    if (!open || queue.length === 0) {
      setRows([]);
      return;
    }
    const upcoming: QueueRow[] = [];
    for (let i = 1; i < queue.length; i++) {
      const at = (index + i) % queue.length;
      upcoming.push({ key: `${queue[at]?.videoId ?? 'x'}-${at}`, track: queue[at], index: at });
    }
    setRows(upcoming);
  }, [open, queue, index]);

  if (!open) return null;

  const commitOrder = (next: QueueRow[]) => {
    // Rebuild the whole queue as: everything already played, the current song,
    // then the new upcoming order — so "next" means what the list now shows.
    const played = queue.slice(0, index);
    const rest = next.map((r) => r.track);
    onReorder([...played, queue[index], ...rest], index);
  };

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 300 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ backgroundColor: theme.shade, color: theme.sand }}
    >
      <div className="flex items-center justify-between px-4 pt-4 sm:px-8">
        <button
          onClick={onClose}
          aria-label="Close player"
          className="rounded-full p-2 opacity-70 transition-opacity hover:opacity-100"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
        <span className="text-[0.65rem] uppercase tracking-[0.25em] opacity-50">{sourceLabel}</span>
        <span className="w-9" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 py-4 sm:flex-row sm:gap-10 sm:px-10 sm:py-6">
        {/* now playing */}
        <div className="flex shrink-0 flex-col items-center text-center sm:w-[320px] sm:justify-center">
          {current?.videoId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailFor(current.videoId)}
              alt=""
              className="aspect-video w-full max-w-[260px] rounded-xl object-cover shadow-2xl sm:max-w-none"
              style={{ backgroundColor: `${theme.sand}12` }}
            />
          )}
          <h2 className="mt-4 line-clamp-2 text-balance text-lg font-bold leading-snug sm:text-xl">
            {current?.title ?? 'Nothing playing'}
          </h2>
          <p className="mt-1 line-clamp-1 text-sm opacity-60">{current?.artist}</p>

          <div className="mt-4 w-full max-w-[280px] sm:max-w-none">
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: `${theme.sand}22` }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: theme.accent }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[0.65rem] tabular-nums opacity-50">
              <span>{formatTime(progress.current)}</span>
              <span>{formatTime(progress.duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <button onClick={onPrev} aria-label="Previous song" className="p-2 opacity-75">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={onToggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="rounded-full p-4 shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: theme.accent, color: theme.shade }}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              )}
            </button>
            <button onClick={onNext} aria-label="Next song" className="p-2 opacity-75">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* the queue */}
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="mb-2 shrink-0 text-[0.6rem] uppercase tracking-[0.25em] opacity-40">
            Next up · drag to reorder
          </p>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm opacity-50">Nothing queued after this one.</p>
          ) : (
            <Reorder.Group
              axis="y"
              values={rows}
              onReorder={setRows}
              data-lenis-prevent
              className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1"
            >
              {rows.map((row) => (
                <Reorder.Item
                  key={row.key}
                  value={row}
                  onDragEnd={() => commitOrder(rows)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                  style={{ backgroundColor: theme.shade }}
                  whileDrag={{ scale: 1.02, backgroundColor: `${theme.accent}22` }}
                >
                  {/* Its own handle, so dragging a row and tapping to play it
                      are different gestures rather than a guess. */}
                  <span
                    className="shrink-0 cursor-grab touch-none p-1 opacity-30 active:cursor-grabbing"
                    aria-hidden
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>

                  <button
                    onClick={() => onPlayAt(row.index)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {row.track?.videoId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailFor(row.track.videoId)}
                        alt=""
                        loading="lazy"
                        className="h-9 w-16 shrink-0 rounded object-cover"
                        style={{ backgroundColor: `${theme.sand}12` }}
                      />
                    ) : (
                      <span
                        className="h-9 w-16 shrink-0 rounded"
                        style={{ backgroundColor: `${theme.sand}12` }}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{row.track?.title}</span>
                      <span className="block truncate text-xs opacity-50">
                        {row.track?.artist}
                      </span>
                    </span>
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </motion.div>
  );
}

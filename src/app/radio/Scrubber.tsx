'use client';

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * The seek bar.
 *
 * Two of these are on screen at once while the mini player is up, so the label
 * is a prop: two sliders announcing the same name is a maze for a screen
 * reader. The hit area is deliberately taller than the visible line so it can
 * be grabbed on touch without drawing a chunky track.
 */
export function Scrubber({
  label,
  progress,
  onSeekFraction,
  onSkipSeconds,
  className,
  trackClassName,
  trackColor,
  fillColor,
  fillClassName = 'h-full rounded-full',
}: {
  label: string;
  progress: { current: number; duration: number };
  onSeekFraction: (fraction: number) => void;
  onSkipSeconds: (delta: number) => void;
  className: string;
  trackClassName: string;
  trackColor: string;
  fillColor: string;
  fillClassName?: string;
}) {
  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

  const seekFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    onSeekFraction((e.clientX - rect.left) / rect.width);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
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
          onSkipSeconds(10);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onSkipSeconds(-10);
        }
      }}
      className={className}
    >
      <div className={trackClassName} style={{ backgroundColor: trackColor }}>
        <div className={fillClassName} style={{ width: `${pct}%`, backgroundColor: fillColor }} />
      </div>
    </div>
  );
}


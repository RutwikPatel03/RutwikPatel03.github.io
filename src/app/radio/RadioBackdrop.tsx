'use client';

import { memo, useMemo } from 'react';
import type { RadioStation } from '@/types/radio';

/**
 * Station backdrops, drawn entirely in CSS and SVG.
 *
 * Generated rather than shipped as images: nothing to download, every layer
 * recolours itself from the station's palette, and it scales to any viewport
 * without a set of exported sizes. Each station gets its own motif so the
 * page reads differently the moment you switch.
 *
 * All motion sits behind `prefers-reduced-motion` via the global stylesheet.
 */

/** Deterministic pseudo-random, so server and client render the same stars. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/** Saloon: barber-pole stripes and warm lamp glow, with CRT scanlines. */
function SaloonLayer({ accent, sand }: { accent: string; sand: string }) {
  return (
    <>
      <div
        className="absolute inset-0 radio-bg-drift"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, ${accent}14 0px, ${accent}14 22px, transparent 22px, transparent 64px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${sand}0a 0px, ${sand}0a 1px, transparent 1px, transparent 4px)`,
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent}3d 0%, transparent 70%)` }}
      />
    </>
  );
}

/** Garba: nested dashed rings, turning like dancers around the centre. */
function GarbaLayer({ accent, sand }: { accent: string; sand: string }) {
  const rings = [
    { r: 110, dash: '2 10', dur: '140s', rev: false },
    { r: 175, dash: '3 14', dur: '190s', rev: true },
    { r: 250, dash: '2 18', dur: '240s', rev: false },
    { r: 330, dash: '3 22', dur: '300s', rev: true },
    { r: 420, dash: '2 26', dur: '380s', rev: false },
  ];
  // Sized in vmin so the whole mandala fits the short edge of the viewport.
  // At vmax the motif overflowed and only its outer arcs were visible, which
  // read as random streaks rather than a pattern.
  return (
    <svg
      className="absolute left-1/2 top-1/2 h-[105vmin] w-[105vmin] -translate-x-1/2 -translate-y-1/2"
      viewBox="-500 -500 1000 1000"
      aria-hidden
    >
      {rings.map((ring, i) => (
        <circle
          key={ring.r}
          cx="0"
          cy="0"
          r={ring.r}
          fill="none"
          stroke={i % 2 ? accent : sand}
          strokeOpacity={i % 2 ? 0.26 : 0.12}
          strokeWidth={2}
          strokeDasharray={ring.dash}
          strokeLinecap="round"
          className={ring.rev ? 'radio-spin-rev' : 'radio-spin'}
          style={{ animationDuration: ring.dur, transformOrigin: 'center' }}
        />
      ))}
      {/* Petal ring, echoing the mandala chalked on a garba ground. Slim and
          numerous so it reads as pattern rather than as stray marks. */}
      <g className="radio-spin" style={{ animationDuration: '420s', transformOrigin: 'center' }}>
        {Array.from({ length: 32 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-292"
            rx="4"
            ry="30"
            fill={accent}
            fillOpacity="0.16"
            transform={`rotate(${i * 11.25})`}
          />
        ))}
      </g>
      <g className="radio-spin-rev" style={{ animationDuration: '260s', transformOrigin: 'center' }}>
        {Array.from({ length: 24 }, (_, i) => (
          <circle
            key={i}
            cx="0"
            cy="-145"
            r="3"
            fill={sand}
            fillOpacity="0.16"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
}

/** Melody: a night sky, faint stars and slow drifting bokeh. */
function MelodyLayer({ accent, sand }: { accent: string; sand: string }) {
  const stars = useMemo(() => {
    const rand = seeded(20260813);
    return Array.from({ length: 90 }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.4 + rand() * 1.2,
      o: 0.15 + rand() * 0.5,
      delay: rand() * 6,
    }));
  }, []);

  return (
    <>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={sand}
            opacity={s.o}
            className="radio-twinkle"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>
      {[
        { size: '46vw', x: '12%', y: '18%', dur: '38s' },
        { size: '34vw', x: '76%', y: '64%', dur: '46s' },
        { size: '26vw', x: '52%', y: '86%', dur: '52s' },
      ].map((b) => (
        <div
          key={b.x}
          className="absolute rounded-full blur-3xl radio-float"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background: `radial-gradient(circle, ${accent}2e 0%, transparent 70%)`,
            animationDuration: b.dur,
          }}
        />
      ))}
    </>
  );
}

/** Gully: concrete grid and hazard stripes, hard edges over soft glow. */
function GullyLayer({ accent, sand }: { accent: string; sand: string }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${sand}0d 1px, transparent 1px), linear-gradient(90deg, ${sand}0d 1px, transparent 1px)`,
          backgroundSize: '58px 58px',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-24 radio-bg-drift"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent}1f 0px, ${accent}1f 16px, transparent 16px, transparent 32px)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 radio-bg-drift"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent}1f 0px, ${accent}1f 16px, transparent 16px, transparent 32px)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent}26 0%, transparent 65%)` }}
      />
    </>
  );
}

/**
 * Memoised on the station. The player polls its progress twice a second, which
 * re-renders the page; without this, ninety star circles and five animated
 * mandala rings were reconciled on every one of those ticks for nothing.
 */
/** My Playlist: a field of equalizer bars, the listener's own music as a wave. */
function PlaylistLayer({ accent, sand }: { accent: string; sand: string }) {
  // Deterministic heights, so the server and client draw the same wave.
  const bars = useMemo(() => {
    const rand = seeded(20260827);
    return Array.from({ length: 48 }, (_, i) => ({
      h: 14 + Math.abs(Math.sin(i * 0.7)) * 52 + rand() * 18,
      delay: (i % 12) * 0.18,
    }));
  }, []);

  return (
    <>
      <div className="absolute inset-x-0 bottom-0 flex h-[62vh] items-end gap-[0.9vw] px-[3vw]">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="radio-float flex-1 rounded-t"
            style={{
              height: `${bar.h}%`,
              background: `linear-gradient(180deg, ${accent}2e 0%, transparent 100%)`,
              animationDuration: `${7 + (i % 5)}s`,
              animationDelay: `${bar.delay}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${sand}22, transparent)` }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[60vmin] w-[80vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)` }}
      />
    </>
  );
}

export const RadioBackdrop = memo(function RadioBackdrop({
  station,
}: {
  station: RadioStation;
}) {
  const { shade, sand, accent } = station.theme;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(120% 90% at 15% 10%, ${accent}33 0%, transparent 55%),
                       radial-gradient(90% 80% at 85% 85%, ${accent}26 0%, transparent 60%),
                       ${shade}`,
        }}
      />

      {/* Artwork when the station has it, generated motif when it does not, so
          stations can gain illustrations one at a time. The image is tinted by
          the station colour and sits under the same vignette and grain as the
          drawn backdrops, which is what keeps the four feeling like one set. */}
      {station.backdrop ? (
        <>
          <picture>
            {station.backdrop.mobileSrc && (
              <source media="(max-width: 767px)" srcSet={station.backdrop.mobileSrc} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={station.backdrop.src}
              alt={station.backdrop.alt ?? ''}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: station.backdrop.opacity ?? 0.55,
                objectPosition: station.backdrop.position ?? 'center',
              }}
            />
          </picture>
          {/* Wash of the station colour, so photography or illustration still
              reads as belonging to this station rather than floating free. */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: accent, opacity: 0.18 }}
          />
        </>
      ) : (
        <>
          {station.id === 'saloon' && <SaloonLayer accent={accent} sand={sand} />}
          {station.id === 'garba' && <GarbaLayer accent={accent} sand={sand} />}
          {station.id === 'melody' && <MelodyLayer accent={accent} sand={sand} />}
          {station.id === 'gully' && <GullyLayer accent={accent} sand={sand} />}
          {station.id === 'mine' && <PlaylistLayer accent={accent} sand={sand} />}
        </>
      )}

      {/* Vignette last, so every motif fades into the same dark edge. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(140% 120% at 50% 50%, transparent 28%, ${shade} 88%)`,
        }}
      />
      <Grain />
    </div>
  );
});

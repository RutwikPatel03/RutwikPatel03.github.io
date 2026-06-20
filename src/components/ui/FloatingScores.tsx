'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Match {
  id: string;
  status: 'live' | 'final' | 'scheduled';
  statusText: string;
  home: { name: string; abbreviation: string; score: string; winner: boolean };
  away: { name: string; abbreviation: string; score: string; winner: boolean };
}

// ─── Football configs ───────────────────────────────────────────────────────
const FOOTBALLS: Array<{
  pos: Record<string, string>;
  size: number;
  opacity: number;
  dur: number;
  del: number;
  glow?: string; // WC26 accent glow colour
}> = [
  // Left column
  { pos: { top: '5%',  left: '0.5%' }, size: 16, opacity: 0.40, dur: 18, del: 0,   glow: '#facc15' },
  { pos: { top: '18%', left: '1.5%' }, size: 11, opacity: 0.28, dur: 23, del: 1.5 },
  { pos: { top: '33%', left: '0%'   }, size: 20, opacity: 0.35, dur: 16, del: 3,   glow: '#22d3ee' },
  { pos: { top: '50%', left: '1%'   }, size: 12, opacity: 0.25, dur: 26, del: 2 },
  { pos: { top: '65%', left: '0.5%' }, size: 17, opacity: 0.32, dur: 20, del: 4,   glow: '#f97316' },
  { pos: { top: '80%', left: '2%'   }, size: 13, opacity: 0.22, dur: 22, del: 1 },
  { pos: { top: '91%', left: '0%'   }, size: 10, opacity: 0.28, dur: 19, del: 5 },

  // Near-left
  { pos: { top: '11%', left: '9%'   }, size: 9,  opacity: 0.18, dur: 31, del: 6 },
  { pos: { top: '75%', left: '11%'  }, size: 10, opacity: 0.20, dur: 29, del: 7 },
  { pos: { top: '55%', left: '8%'   }, size: 8,  opacity: 0.15, dur: 35, del: 9 },

  // Right column
  { pos: { top: '7%',  right: '0.5%' }, size: 14, opacity: 0.38, dur: 20, del: 0.5, glow: '#a78bfa' },
  { pos: { top: '22%', right: '1%'   }, size: 18, opacity: 0.30, dur: 24, del: 2.5 },
  { pos: { top: '40%', right: '0%'   }, size: 11, opacity: 0.25, dur: 17, del: 4 },
  { pos: { top: '57%', right: '1.5%' }, size: 16, opacity: 0.36, dur: 21, del: 1,   glow: '#fb7185' },
  { pos: { top: '73%', right: '0.5%' }, size: 13, opacity: 0.28, dur: 19, del: 3 },
  { pos: { top: '88%', right: '1%'   }, size: 10, opacity: 0.22, dur: 25, del: 5 },

  // Near-right
  { pos: { top: '3%',  right: '11%' }, size: 9,  opacity: 0.18, dur: 33, del: 8 },
  { pos: { top: '94%', right: '9%'  }, size: 11, opacity: 0.20, dur: 27, del: 6 },
];

function seed(i: number, a: number, b: number, range: number, offset: number): number {
  return ((i * a + b) % range) - offset;
}

function roamPath(i: number) {
  return {
    x: [0, seed(i, 13, 7, 44, 22), seed(i, 7, 11, 32, 16), seed(i, 19, 3, 26, 13), 0],
    y: [0, seed(i, 11, 5, 38, 19), seed(i, 17, 13, 30, 15), seed(i, 23, 9, 22, 11), 0],
  };
}

// ─── Score chip positions ───────────────────────────────────────────────────
const SCORE_POSITIONS = [
  { top: '13%', left: '2%' },
  { top: '28%', right: '2%' },
  { top: '58%', left: '1.5%' },
  { top: '70%', right: '2.5%' },
  { top: '84%', left: '3%' },
];

const SCORE_PATHS = [
  { x: [0, 20, 8, 28, 0],   y: [0, -14, 10, -6, 0],  dur: 22, del: 0 },
  { x: [0, -24, -10, -30, 0], y: [0, 16, -12, 8, 0],  dur: 27, del: 2 },
  { x: [0, 16, 34, 18, 0],  y: [0, -20, -8, 12, 0],   dur: 20, del: 4 },
  { x: [0, -18, -32, -12, 0], y: [0, -10, 16, -18, 0], dur: 24, del: 1 },
  { x: [0, 28, 12, 22, 0],  y: [0, 14, -18, 8, 0],    dur: 30, del: 3 },
];

// ─── Live chip ──────────────────────────────────────────────────────────────
function LiveChip({ match }: { match: Match }) {
  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-mono bg-background/70 backdrop-blur-md border border-emerald-400/60"
      style={{ boxShadow: '0 0 16px 3px rgba(52,211,153,0.35), 0 0 40px 6px rgba(52,211,153,0.12)' }}
    >
      {/* pulsing ring */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>

      <span className="text-emerald-400 font-bold tracking-wide text-[10px] uppercase">Live</span>

      <span className="w-px h-4 bg-border/50" />

      <span className="text-foreground font-semibold">{match.home.abbreviation}</span>
      <span className="text-emerald-300 font-bold text-sm tabular-nums">{match.home.score}</span>
      <span className="text-muted-foreground/60 text-xs">—</span>
      <span className="text-emerald-300 font-bold text-sm tabular-nums">{match.away.score}</span>
      <span className="text-foreground font-semibold">{match.away.abbreviation}</span>

      <span className="text-emerald-400/80 text-[10px] ml-0.5">{match.statusText}</span>
    </div>
  );
}

function FinishedChip({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/70 bg-background/50 backdrop-blur-md text-[11px] font-mono whitespace-nowrap">
      <span className={`font-semibold ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.home.abbreviation}
      </span>
      <span className={`font-bold tabular-nums ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.home.score}
      </span>
      <span className="text-muted-foreground/50 text-[10px]">–</span>
      <span className={`font-bold tabular-nums ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.away.score}
      </span>
      <span className={`font-semibold ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.away.abbreviation}
      </span>
      <span className="text-muted-foreground/50 text-[9px] ml-1">FT</span>
    </div>
  );
}

function ScheduledChip({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/50 bg-background/40 backdrop-blur-md text-[11px] font-mono whitespace-nowrap text-muted-foreground">
      <span>{match.home.abbreviation}</span>
      <span className="text-[9px] opacity-60">vs</span>
      <span>{match.away.abbreviation}</span>
      <span className="text-[9px] ml-1 opacity-50">⚽</span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function FloatingScores() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/worldcup')
      .then((r) => r.json())
      .then((data) => { if (data.matches) setMatches(data.matches.slice(0, 5)); })
      .catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* ── Footballs ── */}
      {FOOTBALLS.map((fb, i) => {
        const path = roamPath(i);
        return (
          <motion.div
            key={i}
            className="absolute select-none"
            style={{ ...fb.pos }}
            initial={{ opacity: 0 }}
            animate={{ opacity: fb.opacity, x: path.x, y: path.y }}
            transition={{
              opacity: { duration: 1.5, delay: fb.del },
              x: { duration: fb.dur, delay: fb.del, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: fb.dur, delay: fb.del, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span
              style={{
                fontSize: `${fb.size}px`,
                lineHeight: 1,
                filter: fb.glow ? `drop-shadow(0 0 6px ${fb.glow})` : undefined,
              }}
            >
              ⚽
            </span>
          </motion.div>
        );
      })}

      {/* ── Score chips ── */}
      {matches.map((match, i) => {
        const pos = SCORE_POSITIONS[i % SCORE_POSITIONS.length];
        const path = SCORE_PATHS[i % SCORE_PATHS.length];
        const isLive = match.status === 'live';

        return (
          <motion.div
            key={match.id}
            className="absolute"
            style={pos}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: isLive ? 1 : 0.62,
              scale: isLive ? [1, 1.02, 1] : 1,
              x: path.x,
              y: path.y,
            }}
            transition={{
              opacity: { duration: 1.5, delay: path.del },
              scale: isLive
                ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: path.del }
                : { duration: 1 },
              x: { duration: path.dur, delay: path.del, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: path.dur, delay: path.del, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {isLive ? (
              <LiveChip match={match} />
            ) : match.status === 'final' ? (
              <FinishedChip match={match} />
            ) : (
              <ScheduledChip match={match} />
            )}
          </motion.div>
        );
      })}

    </div>
  );
}

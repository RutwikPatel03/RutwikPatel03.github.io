'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';

interface Match {
  id: string;
  status: 'live' | 'final' | 'scheduled';
  statusText: string;
  home: { name: string; abbreviation: string; score: string; winner: boolean };
  away: { name: string; abbreviation: string; score: string; winner: boolean };
}

// ─── Deterministic pseudo-random (stable between server/client) ───────────────
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const WC26_GLOWS = ['#facc15', '#22d3ee', '#f97316', '#a78bfa', '#fb7185', '#34d399'];

// 36 footballs scattered across the whole hero. Center band is kept sparse so
// the balls frame the name/photo instead of covering it.
function buildFootballs() {
  const balls: Array<{
    top: number; left: number; size: number; opacity: number;
    dur: number; del: number; glow?: string;
    x: number[]; y: number[];
  }> = [];

  let i = 0;
  let attempts = 0;
  while (balls.length < 36 && attempts < 400) {
    attempts++;
    const s = attempts * 3.17;
    const left = rand(s + 1) * 100;
    const top = rand(s + 2) * 100;

    // Keep the central content area lighter (but not empty)
    const inCenter = left > 26 && left < 74 && top > 22 && top < 82;
    if (inCenter && rand(s + 9) > 0.28) continue;

    const size = 8 + Math.floor(rand(s + 3) * 16); // 8–24px
    const big = size > 16;
    balls.push({
      top, left, size,
      opacity: 0.18 + rand(s + 4) * 0.28,        // 0.18–0.46
      dur: 16 + rand(s + 5) * 20,                // 16–36s
      del: rand(s + 6) * 8,                      // 0–8s
      glow: big && rand(s + 7) > 0.45 ? WC26_GLOWS[i % WC26_GLOWS.length] : undefined,
      x: [0, (rand(s + 10) - 0.5) * 50, (rand(s + 11) - 0.5) * 36, (rand(s + 12) - 0.5) * 44, 0],
      y: [0, (rand(s + 13) - 0.5) * 44, (rand(s + 14) - 0.5) * 32, (rand(s + 15) - 0.5) * 40, 0],
    });
    i++;
  }
  return balls;
}

// Score chips scattered down both edges (clear of the central content).
const SCORE_POSITIONS = [
  { top: '14%', left: '2%' },
  { top: '30%', right: '2%' },
  { top: '50%', left: '2.5%' },
  { top: '68%', right: '2.5%' },
  { top: '85%', left: '4%' },
];

const SCORE_PATHS = [
  { x: [0, 18, 8, 24, 0],    y: [0, -12, 9, -6, 0],   dur: 22, del: 0 },
  { x: [0, -20, -9, -26, 0], y: [0, 14, -10, 7, 0],   dur: 27, del: 2 },
  { x: [0, 14, 28, 16, 0],   y: [0, -16, -7, 10, 0],  dur: 20, del: 4 },
  { x: [0, -16, -28, -10, 0],y: [0, -9, 14, -16, 0],  dur: 24, del: 1 },
  { x: [0, 24, 10, 18, 0],   y: [0, 12, -15, 7, 0],   dur: 30, del: 3 },
];

// ─── Chips ────────────────────────────────────────────────────────────────
function LiveChip({ match }: { match: Match }) {
  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-mono bg-background/90 backdrop-blur-md border border-emerald-400/70 shadow-lg"
      style={{ boxShadow: '0 0 18px 4px rgba(52,211,153,0.45), 0 0 48px 8px rgba(52,211,153,0.18)' }}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-emerald-500 font-bold tracking-wide text-[10px] uppercase">Live</span>
      <span className="w-px h-4 bg-border" />
      <span className="text-foreground font-semibold">{match.home.abbreviation}</span>
      <span className="text-emerald-500 font-bold text-sm tabular-nums">{match.home.score}</span>
      <span className="text-muted-foreground text-xs">—</span>
      <span className="text-emerald-500 font-bold text-sm tabular-nums">{match.away.score}</span>
      <span className="text-foreground font-semibold">{match.away.abbreviation}</span>
      <span className="text-emerald-500/90 text-[10px] ml-0.5">{match.statusText}</span>
    </div>
  );
}

function FinishedChip({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background/85 backdrop-blur-md text-[12px] font-mono whitespace-nowrap shadow-md">
      <span className={`font-semibold ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.home.abbreviation}
      </span>
      <span className={`font-bold text-sm tabular-nums ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.home.score}
      </span>
      <span className="text-muted-foreground/60 text-[11px]">–</span>
      <span className={`font-bold text-sm tabular-nums ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.away.score}
      </span>
      <span className={`font-semibold ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {match.away.abbreviation}
      </span>
      <span className="text-muted-foreground/70 text-[9px] ml-1 font-semibold">FT</span>
    </div>
  );
}

function ScheduledChip({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background/80 backdrop-blur-md text-[12px] font-mono whitespace-nowrap text-foreground/80 shadow-md">
      <span className="font-semibold">{match.home.abbreviation}</span>
      <span className="text-[10px] text-muted-foreground">vs</span>
      <span className="font-semibold">{match.away.abbreviation}</span>
      <span className="text-[10px] ml-0.5">⚽</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function FloatingScores() {
  const [matches, setMatches] = useState<Match[]>([]);
  const footballs = useMemo(() => buildFootballs(), []);

  useEffect(() => {
    fetch('/api/worldcup')
      .then((r) => r.json())
      .then((data) => { if (data.matches) setMatches(data.matches.slice(0, 5)); })
      .catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* ── Footballs ── */}
      {footballs.map((fb, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ top: `${fb.top}%`, left: `${fb.left}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: fb.opacity, x: fb.x, y: fb.y }}
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
      ))}

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
              opacity: 1,
              scale: isLive ? [1, 1.03, 1] : 1,
              x: path.x,
              y: path.y,
            }}
            transition={{
              opacity: { duration: 1.2, delay: path.del },
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

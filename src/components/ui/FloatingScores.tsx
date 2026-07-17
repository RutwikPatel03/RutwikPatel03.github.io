'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

interface Match {
  id: string;
  date: string;
  status: 'live' | 'final' | 'scheduled';
  statusText: string;
  home: { name: string; abbreviation: string; score: string; winner: boolean };
  away: { name: string; abbreviation: string; score: string; winner: boolean };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// ─── Deterministic pseudo-random (stable between server/client) ───────────────
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const WC26_GLOWS = ['#facc15', '#22d3ee', '#f97316', '#a78bfa', '#fb7185', '#34d399'];

// 36 footballs scattered fully at random across the whole hero — including
// the center, behind the name and photo.
function buildFootballs() {
  const balls: Array<{
    top: number; left: number; size: number; opacity: number;
    dur: number; del: number; glow?: string;
    x: number[]; y: number[];
  }> = [];

  for (let i = 0; i < 36; i++) {
    const s = (i + 1) * 3.17;
    const left = rand(s + 1) * 100;
    const top = rand(s + 2) * 100;
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

// Gentle sway only — kept small so chips stay pinned to the edges and never
// wander across the hero text.
const SCORE_PATHS = [
  { x: [0, 6, 3, 8, 0],    y: [0, -5, 4, -3, 0],  dur: 26, del: 0 },
  { x: [0, -7, -3, -9, 0], y: [0, 5, -4, 3, 0],   dur: 30, del: 2 },
  { x: [0, 5, 9, 5, 0],    y: [0, -6, -3, 5, 0],  dur: 24, del: 4 },
  { x: [0, -6, -9, -4, 0], y: [0, -4, 5, -6, 0],  dur: 28, del: 1 },
  { x: [0, 8, 4, 6, 0],    y: [0, 5, -5, 3, 0],   dur: 32, del: 3 },
];

// ─── Chips ────────────────────────────────────────────────────────────────
function LiveChip({ match }: { match: Match }) {
  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-mono bg-card border border-emerald-400/70 shadow-xl ring-1 ring-emerald-400/20"
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
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-[12px] font-mono whitespace-nowrap shadow-lg ring-1 ring-black/5 dark:ring-white/5">
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
      <span className="w-px h-3.5 bg-border mx-0.5" />
      <span className="text-muted-foreground/80 text-[9px] font-semibold">FT</span>
      <span className="text-muted-foreground/60 text-[9px]">· {formatTime(match.date)}</span>
    </div>
  );
}

function ScheduledChip({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-[12px] font-mono whitespace-nowrap text-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/5">
      <span className="font-semibold">{match.home.abbreviation}</span>
      <span className="text-[10px] text-muted-foreground">vs</span>
      <span className="font-semibold">{match.away.abbreviation}</span>
      <span className="w-px h-3.5 bg-border mx-0.5" />
      <span className="text-muted-foreground text-[10px]">🕐 {formatTime(match.date)}</span>
    </div>
  );
}

// ─── Star player photos (WC26 final: Argentina vs Spain) ────────────────────
// Full-height figures anchored to each edge, fading toward the center so the
// hero text stays readable. Desktop-only (the parent is `hidden lg:block`).
function PlayerFigure({
  src,
  side,
  glow,
}: {
  src: string;
  side: 'left' | 'right';
  glow: string;
}) {
  const isRight = side === 'right';
  // Opaque at the outer edge, fading to transparent before it reaches the text.
  const mask = `linear-gradient(to ${isRight ? 'left' : 'right'}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 26%, rgba(0,0,0,0) 66%)`;
  return (
    <motion.div
      className={`absolute top-0 bottom-0 ${isRight ? 'right-0' : 'left-0'} w-[40%] xl:w-[34%]`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 1.4 }}
    >
      {/* Country-colour wash at the base, tying the figure to its kit */}
      <div
        className={`absolute bottom-0 ${isRight ? 'right-0' : 'left-0'} h-1/3 w-full`}
        style={{ background: `linear-gradient(to top, ${glow}, transparent)`, opacity: 0.25 }}
      />
      <Image
        src={src}
        alt=""
        fill
        sizes="40vw"
        quality={72}
        className="object-cover object-top"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      />
    </motion.div>
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block" aria-hidden="true">

      {/* ── Star players: WC26 final — Argentina vs Spain ── */}
      <PlayerFigure side="left" src="/myimg/messi.jpg" glow="#6cb7e0" />
      <PlayerFigure side="right" src="/myimg/yamal.jpg" glow="#e03a3a" />

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
            className="absolute z-10"
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

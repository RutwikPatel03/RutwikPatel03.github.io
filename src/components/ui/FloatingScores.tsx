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

// Each chip gets a starting position and a roaming path (x/y keyframes in px)
const ROAM_PATHS = [
  {
    top: '12%', left: '2%',
    x: [0, 24, 10, 36, 0], y: [0, -18, 12, -8, 0],
    duration: 22, delay: 0,
  },
  {
    top: '30%', right: '2%',
    x: [0, -30, -12, -40, 0], y: [0, 20, -15, 8, 0],
    duration: 27, delay: 2,
  },
  {
    top: '60%', left: '1%',
    x: [0, 18, 40, 22, 0], y: [0, -24, -10, 14, 0],
    duration: 20, delay: 4,
  },
  {
    top: '72%', right: '3%',
    x: [0, -20, -38, -15, 0], y: [0, -12, 18, -22, 0],
    duration: 24, delay: 1,
  },
  {
    top: '48%', left: '0%',
    x: [0, 32, 14, 28, 0], y: [0, 16, -20, 10, 0],
    duration: 30, delay: 3,
  },
];

function ScoreChip({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-background/30 backdrop-blur-md text-[11px] font-mono whitespace-nowrap select-none"
    >
      {isLive && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}

      <span className="text-foreground/70 font-semibold">{match.home.abbreviation}</span>

      {isScheduled ? (
        <span className="text-muted-foreground px-1">vs</span>
      ) : (
        <>
          <span className={`font-bold tabular-nums ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.home.score}
          </span>
          <span className="text-muted-foreground/50">–</span>
          <span className={`font-bold tabular-nums ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.away.score}
          </span>
        </>
      )}

      <span className="text-foreground/70 font-semibold">{match.away.abbreviation}</span>

      <span className="text-muted-foreground/60 text-[9px] ml-0.5">
        {isLive ? match.statusText : isScheduled ? '🕐' : 'FT'}
      </span>
    </div>
  );
}

export default function FloatingScores() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/worldcup')
      .then((r) => r.json())
      .then((data) => {
        if (data.matches) setMatches(data.matches.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {matches.map((match, i) => {
        const path = ROAM_PATHS[i % ROAM_PATHS.length];

        return (
          <motion.div
            key={match.id}
            className="absolute opacity-[0.18] dark:opacity-[0.22] hover:opacity-60 transition-opacity"
            style={{
              top: path.top,
              left: 'left' in path ? path.left : undefined,
              right: 'right' in path ? path.right : undefined,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: [0, 0.18, 0.18, 0.18],
              scale: 1,
              x: path.x,
              y: path.y,
            }}
            transition={{
              opacity: { duration: 2, delay: path.delay },
              scale: { duration: 1.5, delay: path.delay },
              x: {
                duration: path.duration,
                delay: path.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              y: {
                duration: path.duration,
                delay: path.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <ScoreChip match={match} />
          </motion.div>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from './BentoGrid';
import { Skeleton } from './Skeleton';

interface MatchTeam {
  name: string;
  abbreviation: string;
  score: string;
  winner: boolean;
}

interface Match {
  id: string;
  date: string;
  status: 'live' | 'final' | 'scheduled';
  statusText: string;
  round: string;
  home: MatchTeam;
  away: MatchTeam;
}

function StatusBadge({ status, text }: { status: Match['status']; text: string }) {
  if (status === 'live') {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        {text}
      </span>
    );
  }
  if (status === 'final') {
    return <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">FT</span>;
  }
  const time = new Date(text).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return <span className="text-[10px] font-medium text-muted-foreground">{time}</span>;
}

function MatchRow({ match }: { match: Match }) {
  const isScheduled = match.status === 'scheduled';

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Home team */}
      <span
        className={`flex-1 text-right text-sm truncate ${
          match.home.winner ? 'font-semibold text-foreground' : 'text-muted-foreground'
        }`}
      >
        {match.home.name}
      </span>

      {/* Score / Status */}
      <div className="flex items-center gap-1.5 min-w-[80px] justify-center">
        {isScheduled ? (
          <StatusBadge status="scheduled" text={match.date} />
        ) : (
          <>
            <span className={`text-sm font-bold w-5 text-right ${match.home.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
              {match.home.score}
            </span>
            <StatusBadge status={match.status} text={match.statusText} />
            <span className={`text-sm font-bold w-5 text-left ${match.away.winner ? 'text-foreground' : 'text-muted-foreground'}`}>
              {match.away.score}
            </span>
          </>
        )}
      </div>

      {/* Away team */}
      <span
        className={`flex-1 text-left text-sm truncate ${
          match.away.winner ? 'font-semibold text-foreground' : 'text-muted-foreground'
        }`}
      >
        {match.away.name}
      </span>
    </div>
  );
}

export default function WorldCupWidget() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/worldcup');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Auto-refresh every 30s if there are live matches, else every 5min
  useEffect(() => {
    const hasLive = matches?.some((m) => m.status === 'live');
    const interval = setInterval(fetchMatches, hasLive ? 30_000 : 300_000);
    return () => clearInterval(interval);
  }, [matches, fetchMatches]);

  if (error) return null;

  return (
    <BentoCard colSpan={3}>
      <BentoCardHeader className="flex flex-row items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <BentoCardTitle>FIFA World Cup 2026</BentoCardTitle>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchMatches}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh scores"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </BentoCardHeader>
      <BentoCardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="divide-y divide-border/50">
            {matches.map((match) => (
              <div key={match.id}>
                {match.round && (
                  <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-3 pt-2 pb-0.5">
                    {match.round}
                  </p>
                )}
                <MatchRow match={match} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No matches scheduled today.</p>
        )}
      </BentoCardContent>
    </BentoCard>
  );
}

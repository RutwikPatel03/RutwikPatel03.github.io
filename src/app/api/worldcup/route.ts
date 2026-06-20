import { NextResponse } from 'next/server';

export const revalidate = 60;

interface ESPNTeam {
  displayName: string;
  abbreviation: string;
  logo?: string;
}

interface ESPNCompetitor {
  homeAway: 'home' | 'away';
  team: ESPNTeam;
  score?: string;
  winner?: boolean;
}

interface ESPNStatusType {
  name: string;
  shortDetail: string;
  completed: boolean;
}

interface ESPNEvent {
  id: string;
  date: string;
  status: {
    type: ESPNStatusType;
  };
  competitions: Array<{
    competitors: ESPNCompetitor[];
    notes?: Array<{ headline?: string }>;
  }>;
}

function mapStatus(name: string): 'live' | 'final' | 'scheduled' {
  if (name === 'STATUS_IN_PROGRESS' || name === 'STATUS_HALFTIME') return 'live';
  if (name === 'STATUS_FULL_TIME' || name === 'STATUS_FINAL' || name === 'STATUS_FULL_PEN' || name === 'STATUS_FULL_ET') return 'final';
  return 'scheduled';
}

export async function GET() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard',
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
    const data = await res.json();

    const events: ESPNEvent[] = data.events ?? [];

    const matches = events.slice(0, 10).map((event) => {
      const competition = event.competitions[0];
      const home = competition.competitors.find((c) => c.homeAway === 'home');
      const away = competition.competitors.find((c) => c.homeAway === 'away');
      const round = competition.notes?.[0]?.headline ?? '';
      const statusType = event.status.type;

      return {
        id: event.id,
        date: event.date,
        status: mapStatus(statusType.name),
        statusText: statusType.shortDetail,
        round,
        home: {
          name: home?.team.displayName ?? '',
          abbreviation: home?.team.abbreviation ?? '',
          score: home?.score ?? '-',
          winner: home?.winner ?? false,
        },
        away: {
          name: away?.team.displayName ?? '',
          abbreviation: away?.team.abbreviation ?? '',
          score: away?.score ?? '-',
          winner: away?.winner ?? false,
        },
      };
    });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch World Cup data' }, { status: 500 });
  }
}

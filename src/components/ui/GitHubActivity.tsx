'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from './BentoGrid';
import { Skeleton } from './Skeleton';
import { socialLinks } from '@/constants';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubData {
  totalContributions: number;
  weeks: ContributionWeek[];
  years: number[];
}

const CONTRIBUTION_LEVELS = [
  'bg-[#ebedf0] dark:bg-[#161b22]',
  'bg-[#9be9a8] dark:bg-[#0e4429]',
  'bg-[#40c463] dark:bg-[#006d32]',
  'bg-[#30a14e] dark:bg-[#26a641]',
  'bg-[#216e39] dark:bg-[#39d353]',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function ContributionGraph({ weeks }: { weeks: ContributionWeek[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the beginning (January) on mount and when weeks change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [weeks]);

  // Get month labels with their positions
  const getMonthPositions = () => {
    const positions: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // Find the first day of the week that's in a new month
      const firstDay = week.contributionDays.find(day => {
        const date = new Date(day.date + 'T00:00:00');
        return date.getDate() <= 7; // First week of month
      });

      if (firstDay) {
        const date = new Date(firstDay.date + 'T00:00:00');
        const month = date.getMonth();
        if (month !== lastMonth) {
          positions.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return positions;
  };

  const monthPositions = getMonthPositions();

  return (
    <div className="w-full">
      {/* Scrollable container for mobile, centered on desktop */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-2 flex justify-center">
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div className="flex text-xs text-muted-foreground mb-1" style={{ paddingLeft: '28px' }}>
            {monthPositions.map((pos, i) => {
              const nextPos = monthPositions[i + 1];
              const width = nextPos
                ? (nextPos.weekIndex - pos.weekIndex) * 13
                : (weeks.length - pos.weekIndex) * 13;
              return (
                <div
                  key={i}
                  style={{
                    width: `${width}px`,
                    marginLeft: i === 0 ? `${pos.weekIndex * 13}px` : 0
                  }}
                >
                  {pos.month}
                </div>
              );
            })}
          </div>

          <div className="flex">
            {/* Day labels column - sticky on scroll */}
            <div className="flex flex-col gap-[3px] pr-1 text-xs text-muted-foreground sticky left-0 bg-card z-10" style={{ width: '28px' }}>
              <div className="h-[10px]"></div>
              <div className="h-[10px] flex items-center text-[10px]">Mon</div>
              <div className="h-[10px]"></div>
              <div className="h-[10px] flex items-center text-[10px]">Wed</div>
              <div className="h-[10px]"></div>
              <div className="h-[10px] flex items-center text-[10px]">Fri</div>
              <div className="h-[10px]"></div>
            </div>

            {/* Contribution grid - fixed size like GitHub */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week.contributionDays[dayIndex];
                    if (!day) {
                      return <div key={dayIndex} className="w-[10px] h-[10px] rounded-sm" />;
                    }
                    return (
                      <div
                        key={dayIndex}
                        className={`w-[10px] h-[10px] rounded-sm ${CONTRIBUTION_LEVELS[getContributionLevel(day.contributionCount)]} cursor-pointer transition-all hover:ring-1 hover:ring-foreground/50`}
                        title={`${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend - outside scroll area */}
      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        {CONTRIBUTION_LEVELS.map((level, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-sm ${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchGitHubData = useCallback(async (year?: number) => {
    setLoading(true);
    try {
      const url = year ? `/api/github?year=${year}` : '/api/github';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      if (!selectedYear && result.years?.length > 0) {
        setSelectedYear(result.years[0]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchGitHubData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    fetchGitHubData(year);
  };

  if (error) {
    return null;
  }

  return (
    <BentoCard colSpan={3}>
      <BentoCardHeader className="flex flex-row items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-foreground" />
          <BentoCardTitle>GitHub Activity</BentoCardTitle>
        </div>
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          @RutwikPatel13
          <ExternalLink className="w-3 h-3" />
        </a>
      </BentoCardHeader>
      <BentoCardContent>
        {loading && !data ? (
          <Skeleton className="h-[160px] w-full" />
        ) : data ? (
          <div className="space-y-4">
            {/* Header with contribution count and year selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-muted-foreground shrink-0">
                <span className="font-semibold text-foreground">{data.totalContributions}</span> contributions in {selectedYear || 'the last year'}
              </p>

              {/* Year Selector - scrollable on mobile */}
              {data.years && data.years.length > 0 && (
                <div className="overflow-x-auto -mx-1 px-1">
                  <div className="flex gap-1 w-max">
                    {data.years.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearChange(year)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                          selectedYear === year
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Graph Section */}
            <ContributionGraph weeks={data.weeks} />
          </div>
        ) : null}
      </BentoCardContent>
    </BentoCard>
  );
}


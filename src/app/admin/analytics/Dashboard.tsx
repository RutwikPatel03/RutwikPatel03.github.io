import Link from 'next/link';
import { MessageSquareQuote, Eye, Users, FileDown, Send, Zap } from 'lucide-react';
import type { AnalyticsSnapshot, Ranked } from '@/lib/analytics';
import LogoutButton from './LogoutButton';

const WINDOWS = [7, 30, 90] as const;

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-heading text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Sparkline({ daily }: { daily: AnalyticsSnapshot['daily'] }) {
  const peak = Math.max(1, ...daily.map((d) => Math.max(d.pageviews, d.uniques)));
  const W = 1000;
  const H = 220;
  const PAD = 10;

  const x = (i: number) => (daily.length <= 1 ? W / 2 : (i / (daily.length - 1)) * W);
  const y = (v: number) => H - PAD - (v / peak) * (H - PAD * 2);
  const points = (key: 'pageviews' | 'uniques') =>
    daily.map((d, i) => `${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">Traffic</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-blue-500" /> Pageviews
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 rounded bg-emerald-500" /> Unique sessions
          </span>
          <span className="tabular-nums">peak {peak}</span>
        </div>
      </div>

      {/* preserveAspectRatio="none" stretches the plot to the container; the
          non-scaling stroke keeps the lines from being stretched with it. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-40 sm:h-52 overflow-visible"
        role="img"
        aria-label="Daily pageviews and unique sessions"
      >
        <defs>
          <linearGradient id="pv-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${points('pageviews')} ${W},${H}`} fill="url(#pv-fill)" />
        <polyline
          points={points('pageviews')}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={points('uniques')}
          fill="none"
          stroke="rgb(16 185 129)"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground tabular-nums">
        <span>{daily[0]?.day}</span>
        <span>{daily[daily.length - 1]?.day}</span>
      </div>
    </div>
  );
}

function RankedList({
  title,
  subtitle,
  items,
  format = (v: string) => v,
  emphasis = false,
}: {
  title: string;
  subtitle?: string;
  items: Ranked[];
  format?: (value: string) => string;
  emphasis?: boolean;
}) {
  const peak = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <h2 className="font-heading text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}

      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No data in this window yet.</p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {items.map((item) => (
            <li key={item.value} className="relative">
              {/* The bar is a background layer so long labels stay readable
                  instead of being squeezed into a fixed-width column. */}
              <div
                className={`absolute inset-y-0 left-0 rounded ${emphasis ? 'bg-blue-500/20' : 'bg-foreground/[0.07]'}`}
                style={{ width: `${Math.max(4, (item.count / peak) * 100)}%` }}
              />
              <div className="relative flex items-baseline justify-between gap-3 px-2 py-1.5">
                <span
                  className={`text-xs sm:text-sm text-foreground ${emphasis ? '' : 'truncate'} ${emphasis ? 'leading-snug' : ''}`}
                >
                  {format(item.value)}
                </span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                  {item.count}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LiveFeed({ recent }: { recent: AnalyticsSnapshot['recent'] }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
      <h2 className="font-heading text-sm font-semibold text-foreground">Live feed</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Last 50 events, newest first.</p>

      {recent.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">Nothing recorded yet.</p>
      ) : (
        <ul className="mt-4 max-h-80 overflow-y-auto space-y-1 font-mono text-[11px]">
          {recent.map((event, i) => (
            <li key={`${event.t}-${i}`} className="flex items-baseline gap-2 text-muted-foreground">
              <span className="shrink-0 tabular-nums">
                {new Date(event.t).toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <span className="text-foreground">{event.event}</span>
              {event.prop && <span className="text-blue-500 truncate">{event.prop}</span>}
              {event.path && <span className="truncate opacity-60">{event.path}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const t = snapshot.totals;
  const pageviews = t.pageview ?? 0;
  const questions = t.chat_question ?? 0;
  const cacheHits = t.chat_cache_hit ?? 0;
  const cacheTotal = cacheHits + (t.chat_cache_miss ?? 0);
  const resumeDownloads = t.resume_download ?? 0;

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground">
              Analytics
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Last {snapshot.days} days · built on the site&apos;s own Redis · cached 60s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {WINDOWS.map((days) => (
                <Link
                  key={days}
                  href={`/admin/analytics?days=${days}`}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    days === snapshot.days
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {days}d
                </Link>
              ))}
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatTile
            label="Unique sessions"
            value={snapshot.uniqueVisitors.toLocaleString()}
            hint="HyperLogLog, deduped across the window"
            icon={Users}
            accent="text-emerald-500"
          />
          <StatTile
            label="Pageviews"
            value={pageviews.toLocaleString()}
            icon={Eye}
            accent="text-blue-500"
          />
          <StatTile
            label="Resume taken"
            value={resumeDownloads.toLocaleString()}
            hint={pageviews > 0 ? `${((resumeDownloads / pageviews) * 100).toFixed(1)}% of views` : undefined}
            icon={FileDown}
            accent="text-amber-500"
          />
          <StatTile
            label="Questions asked"
            value={questions.toLocaleString()}
            hint={
              cacheTotal > 0
                ? `${Math.round((cacheHits / cacheTotal) * 100)}% served from cache`
                : undefined
            }
            icon={MessageSquareQuote}
            accent="text-purple-500"
          />
        </div>

        <RankedList
          title="What people ask the AI"
          subtitle="Normalized, ranked. Anything high here that the site does not answer well is a gap worth closing."
          items={snapshot.topQuestions}
          emphasis
        />

        <Sparkline daily={snapshot.daily} />

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <RankedList title="Top pages" items={snapshot.topPaths} />
          <RankedList title="Referrers" subtitle="External only" items={snapshot.topReferrers} />
          <RankedList
            title="Sections read"
            subtitle="Held at least half the viewport for a second"
            items={snapshot.topSections}
          />
          <RankedList title="Projects opened" items={snapshot.topProjects} />
          <RankedList
            title="Scroll depth"
            subtitle="How far down the page people get"
            items={snapshot.scrollDepth}
            format={(v) => `${v}%`}
          />
          <RankedList title="Command palette" items={snapshot.topCommands} />
        </div>

        <LiveFeed recent={snapshot.recent} />

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Send className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wide">Contact forms sent</span>
            </div>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground tabular-nums">
              {(t.contact_submit ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wide">Groq calls avoided</span>
            </div>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground tabular-nums">
              {cacheHits.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
          No IP addresses, user agents, or fingerprints are stored. Sessions are random per-tab ids
          used only for cardinality counting. Daily rollups expire after 90 days. Visitors sending
          Do Not Track are never recorded.
        </p>
      </div>
    </div>
  );
}

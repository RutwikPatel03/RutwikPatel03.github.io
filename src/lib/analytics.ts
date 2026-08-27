import { redis } from './redis';
import { normalizeQuestion } from './chat-prompts';
import type { AnalyticsEvent, AnyEvent } from './analytics-events';

// A first-party event store on the Redis instance the site already runs on.
//
// Nothing here keeps a row per event. Every write lands in a per-day rollup:
// a hash for "how many of each thing", sorted sets for "ranked by what", and a
// HyperLogLog for "how many distinct people". A busy day costs a few dozen keys
// instead of thousands of rows, and every dashboard question becomes one read
// of an already-aggregated structure rather than a scan.
//
// No IP, user agent, or fingerprint is stored. The session id is a random
// string the browser mints per tab and forgets on close; it exists so "unique
// visitors" means something, and it is only ever fed to a HyperLogLog, which
// counts cardinality without retaining its members.

/** Daily keys self-prune, so the store cannot grow without bound. */
const RETENTION_DAYS = 90;
const TTL_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

/** The live feed is a debugging aid, not a rollup; only the newest are kept. */
const RECENT_FEED_SIZE = 200;

/** Dashboard reads are cached briefly so a refresh does not re-run ~100 commands. */
const SNAPSHOT_TTL_SECONDS = 60;

/**
 * Ceiling on a write that sits on a user-facing request path.
 *
 * These helpers already swallow errors, but a swallowed error is not the same
 * as a bounded wait: the Upstash client retries with backoff, so an unreachable
 * Redis stalls rather than failing fast. On the chat route that stall surfaces
 * to the visitor as "having trouble connecting" — analytics breaking the very
 * thing it is measuring. Losing one count is always the better trade.
 */
const WRITE_TIMEOUT_MS = 1000;

function withTimeout(work: Promise<unknown>, label: string): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`${label} exceeded ${WRITE_TIMEOUT_MS}ms, abandoning the write`);
      resolve();
    }, WRITE_TIMEOUT_MS);

    work
      .catch((error) => console.error(`${label} failed:`, error))
      .finally(() => {
        clearTimeout(timer);
        resolve();
      });
  });
}

const K = {
  events: (day: string) => `an:d:${day}:ev`,
  prop: (day: string, event: string) => `an:d:${day}:p:${event}`,
  path: (day: string) => `an:d:${day}:path`,
  referrer: (day: string) => `an:d:${day}:ref`,
  unique: (day: string) => `an:d:${day}:uniq`,
  questions: (day: string) => `an:d:${day}:q`,
  recent: 'an:recent',
  snapshot: (days: number) => `an:snapshot:${days}`,
} as const;

export const dayKey = (date = new Date()): string => date.toISOString().slice(0, 10);

/** The window being reported on, newest last. */
export function recentDays(count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

// ===========================================
// Writes
// ===========================================

export interface RecordInput {
  sessionId: string;
  referrer?: string | null;
  events: AnalyticsEvent[];
}

/**
 * Writes one visitor's batch in a single pipeline. Upstash bills per command,
 * so the batching on the client side is what keeps this affordable; sending a
 * request per click would multiply the cost by an order of magnitude.
 */
export async function recordEvents({ sessionId, referrer, events }: RecordInput): Promise<void> {
  const day = dayKey();
  const pipeline = redis.pipeline();

  // Every key touched gets its expiry refreshed once per batch rather than once
  // per write, which keeps the command count flat as a batch grows.
  const touched = new Set<string>();
  const touch = (key: string): string => {
    touched.add(key);
    return key;
  };

  pipeline.pfadd(touch(K.unique(day)), sessionId);

  if (referrer) {
    pipeline.zincrby(touch(K.referrer(day)), 1, referrer);
  }

  for (const { event, prop, path } of events) {
    pipeline.hincrby(touch(K.events(day)), event, 1);
    if (prop) {
      pipeline.zincrby(touch(K.prop(day, event)), 1, prop);
    }
    if (event === 'pageview' && path) {
      pipeline.zincrby(touch(K.path(day)), 1, path);
    }
  }

  for (const key of touched) {
    pipeline.expire(key, TTL_SECONDS);
  }

  const feed = events.map((e) =>
    JSON.stringify({ t: Date.now(), event: e.event, prop: e.prop ?? null, path: e.path ?? null })
  );
  if (feed.length > 0) {
    pipeline.lpush(K.recent, ...feed);
    pipeline.ltrim(K.recent, 0, RECENT_FEED_SIZE - 1);
  }

  await pipeline.exec();
}

/** Bumps a server-side event that the browser is not allowed to send itself. */
export async function recordServerEvent(event: AnyEvent, prop?: string): Promise<void> {
  const day = dayKey();
  const pipeline = redis.pipeline();
  pipeline.hincrby(K.events(day), event, 1);
  pipeline.expire(K.events(day), TTL_SECONDS);
  if (prop) {
    pipeline.zincrby(K.prop(day, event), 1, prop);
    pipeline.expire(K.prop(day, event), TTL_SECONDS);
  }
  await withTimeout(pipeline.exec(), `recordServerEvent(${event})`);
}

/**
 * Records what a visitor asked the AI assistant.
 *
 * This is the highest-signal data the site collects: a ranked list of what
 * people actually want to know is a to-do list for the resume and the copy. The
 * question is normalized with the same function the answer cache uses, so
 * "What's his experience?" and "whats his experience" rank as one entry.
 *
 * Analytics must never be able to break the chat: this neither throws nor
 * blocks for longer than WRITE_TIMEOUT_MS.
 */
export async function recordQuestion(question: string, cached: boolean): Promise<void> {
  const normalized = normalizeQuestion(question).slice(0, 200);
  if (!normalized) return;

  const day = dayKey();
  const pipeline = redis.pipeline();
  pipeline.zincrby(K.questions(day), 1, normalized);
  pipeline.expire(K.questions(day), TTL_SECONDS);
  pipeline.hincrby(K.events(day), 'chat_question', 1);
  pipeline.hincrby(K.events(day), cached ? 'chat_cache_hit' : 'chat_cache_miss', 1);
  pipeline.expire(K.events(day), TTL_SECONDS);
  await withTimeout(pipeline.exec(), 'recordQuestion');
}

// ===========================================
// Reads
// ===========================================

export interface Ranked {
  value: string;
  count: number;
}

export interface RecentEvent {
  t: number;
  event: string;
  prop: string | null;
  path: string | null;
}

export interface AnalyticsSnapshot {
  days: number;
  generatedAt: number;
  totals: Record<string, number>;
  uniqueVisitors: number;
  daily: { day: string; pageviews: number; uniques: number }[];
  topPaths: Ranked[];
  topReferrers: Ranked[];
  topProjects: Ranked[];
  topSections: Ranked[];
  topCommands: Ranked[];
  topQuestions: Ranked[];
  scrollDepth: Ranked[];
  recent: RecentEvent[];
}

/** ZRANGE ... REV WITHSCORES returns a flat [member, score, member, score] array. */
function parseRanked(raw: unknown): Ranked[] {
  if (!Array.isArray(raw)) return [];
  const out: Ranked[] = [];
  for (let i = 0; i < raw.length - 1; i += 2) {
    out.push({ value: String(raw[i]), count: Number(raw[i + 1]) || 0 });
  }
  return out;
}

/**
 * Daily sorted sets are merged here rather than with ZUNIONSTORE. The windows
 * are small enough that the difference is noise, and a store command would need
 * a temp key plus cleanup for a result that is read once and thrown away.
 */
function mergeRanked(lists: Ranked[][], limit: number): Ranked[] {
  const totals = new Map<string, number>();
  for (const list of lists) {
    for (const { value, count } of list) {
      totals.set(value, (totals.get(value) ?? 0) + count);
    }
  }
  return Array.from(totals, ([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** The per-event sorted sets worth ranking, in snapshot field order. */
const RANKED_EVENT_PROPS = [
  'project_open',
  'section_view',
  'command_selected',
  'scroll_depth',
] as const;

const TOP_N = 15;

async function buildSnapshot(days: number): Promise<AnalyticsSnapshot> {
  const window = recentDays(days);
  const pipeline = redis.pipeline();

  // Order matters: results come back positionally, and the offsets below
  // assume this exact sequence.
  for (const day of window) pipeline.hgetall(K.events(day));
  for (const day of window) pipeline.pfcount(K.unique(day));
  for (const day of window) pipeline.zrange(K.path(day), 0, TOP_N - 1, { rev: true, withScores: true });
  for (const day of window) pipeline.zrange(K.referrer(day), 0, TOP_N - 1, { rev: true, withScores: true });
  for (const day of window) pipeline.zrange(K.questions(day), 0, TOP_N - 1, { rev: true, withScores: true });
  for (const event of RANKED_EVENT_PROPS) {
    for (const day of window) {
      pipeline.zrange(K.prop(day, event), 0, TOP_N - 1, { rev: true, withScores: true });
    }
  }
  // pfcount takes a required first key plus a rest, so the union is spread in two parts.
  const [firstUniqueKey, ...otherUniqueKeys] = window.map(K.unique);
  pipeline.pfcount(firstUniqueKey, ...otherUniqueKeys);
  pipeline.lrange(K.recent, 0, 49);

  const results = await pipeline.exec<unknown[]>();

  const n = window.length;
  let cursor = 0;
  const take = (): unknown[] => results.slice(cursor, (cursor += n));

  const eventHashes = take() as (Record<string, string> | null)[];
  const dailyUniques = take() as number[];
  const pathLists = take().map(parseRanked);
  const referrerLists = take().map(parseRanked);
  const questionLists = take().map(parseRanked);

  const propLists: Record<string, Ranked[][]> = {};
  for (const event of RANKED_EVENT_PROPS) {
    propLists[event] = take().map(parseRanked);
  }

  const uniqueVisitors = Number(results[cursor++]) || 0;
  const recentRaw = results[cursor++];

  const totals: Record<string, number> = {};
  for (const hash of eventHashes) {
    for (const [event, count] of Object.entries(hash ?? {})) {
      totals[event] = (totals[event] ?? 0) + (Number(count) || 0);
    }
  }

  const daily = window.map((day, i) => ({
    day,
    pageviews: Number(eventHashes[i]?.pageview ?? 0) || 0,
    uniques: Number(dailyUniques[i]) || 0,
  }));

  const recent: RecentEvent[] = (Array.isArray(recentRaw) ? recentRaw : [])
    .map((entry) => {
      // Upstash deserializes JSON strings automatically, so an entry arrives as
      // an object here and as a string only when that behavior is off.
      if (entry && typeof entry === 'object') return entry as RecentEvent;
      try {
        return JSON.parse(String(entry)) as RecentEvent;
      } catch {
        return null;
      }
    })
    .filter((e): e is RecentEvent => e !== null && typeof e.event === 'string');

  return {
    days,
    generatedAt: Date.now(),
    totals,
    uniqueVisitors,
    daily,
    topPaths: mergeRanked(pathLists, TOP_N),
    topReferrers: mergeRanked(referrerLists, TOP_N),
    topProjects: mergeRanked(propLists.project_open, TOP_N),
    topSections: mergeRanked(propLists.section_view, TOP_N),
    topCommands: mergeRanked(propLists.command_selected, TOP_N),
    topQuestions: mergeRanked(questionLists, TOP_N),
    scrollDepth: mergeRanked(propLists.scroll_depth, 4),
    recent,
  };
}

/**
 * A snapshot costs roughly four commands per day in the window, so a 30-day
 * view is ~130 commands. Caching it for a minute means repeatedly refreshing
 * the dashboard costs one read instead of re-running the whole fan-out.
 */
export async function getSnapshot(days: number, fresh = false): Promise<AnalyticsSnapshot> {
  if (!fresh) {
    try {
      const cached = await redis.get<AnalyticsSnapshot>(K.snapshot(days));
      if (cached) return cached;
    } catch (error) {
      console.error('Snapshot cache read failed, rebuilding:', error);
    }
  }

  const snapshot = await buildSnapshot(days);

  try {
    await redis.set(K.snapshot(days), snapshot, { ex: SNAPSHOT_TTL_SECONDS });
  } catch (error) {
    console.error('Snapshot cache write failed:', error);
  }

  return snapshot;
}

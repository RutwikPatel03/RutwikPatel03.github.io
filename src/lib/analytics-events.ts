// The event vocabulary, shared by the browser and the ingest route.
//
// Event names and property values both end up as Redis key fragments and sorted
// set members, so neither is trusted from a request body — they are allowlisted
// and sanitized here for the same reason /api/presence validates its station id
// before letting it name a key. An unvalidated value would let anyone write
// arbitrary keys into the analytics namespace.

/** Events the browser is allowed to send. */
export const CLIENT_EVENTS = [
  'pageview',
  'section_view',
  'scroll_depth',
  'resume_download',
  'project_open',
  'project_external',
  'command_open',
  'command_selected',
  'chat_topic',
  'email_copy',
  'radio_play',
  'outbound_click',
] as const;

/**
 * Events only ever written server-side. Keeping them out of CLIENT_EVENTS means
 * a forged request cannot inflate the numbers that matter most.
 */
export const SERVER_EVENTS = [
  'chat_question',
  'chat_cache_hit',
  'chat_cache_miss',
  'contact_submit',
] as const;

export type ClientEvent = (typeof CLIENT_EVENTS)[number];
export type ServerEvent = (typeof SERVER_EVENTS)[number];
export type AnyEvent = ClientEvent | ServerEvent;

const CLIENT_EVENT_SET: ReadonlySet<string> = new Set(CLIENT_EVENTS);

export const isClientEvent = (value: unknown): value is ClientEvent =>
  typeof value === 'string' && CLIENT_EVENT_SET.has(value);

export interface AnalyticsEvent {
  event: ClientEvent;
  /** The dimension being counted: which project, which section, which station. */
  prop?: string;
  /** Page the event happened on. */
  path?: string;
}

export interface TrackPayload {
  sessionId: string;
  referrer?: string;
  events: AnalyticsEvent[];
}

/** A batch is capped so one request can never fan out into unbounded writes. */
export const MAX_EVENTS_PER_BATCH = 20;
export const MAX_PROP_LENGTH = 64;
export const MAX_PATH_LENGTH = 128;

/** Matches the session id format /api/presence already accepts. */
export const SESSION_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

/** Property values become sorted set members, so they are cut to a safe alphabet. */
export function sanitizeProp(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._/-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned ? cleaned.slice(0, MAX_PROP_LENGTH) : null;
}

/**
 * Paths keep their shape but lose query strings and fragments. Those are
 * attacker-controlled and unbounded, and would shatter one page's count across
 * thousands of near-identical members.
 */
export function sanitizePath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  const path = value.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (path.length > MAX_PATH_LENGTH) return null;
  return /^[a-zA-Z0-9/_.-]+$/.test(path) ? path : null;
}

/**
 * Referrers are reduced to a bare hostname. A full referrer URL can carry
 * search terms and session tokens from the originating site, none of which
 * belong in this store.
 */
export function sanitizeReferrer(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    return /^[a-z0-9.-]{1,64}$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

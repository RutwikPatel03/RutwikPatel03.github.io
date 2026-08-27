import {
  MAX_EVENTS_PER_BATCH,
  type AnalyticsEvent,
  type ClientEvent,
} from './analytics-events';

// The browser half of the event pipeline.
//
// Events are buffered and flushed together rather than sent per click, for two
// reasons. Upstash bills per command, so folding a visit's events into one
// pipeline is the difference between ~20 commands per visit and ~20 per click.
// And a beacon fired from `visibilitychange` survives the tab closing, which a
// fetch from `beforeunload` does not — that is where most last events land.

const ENDPOINT = '/api/track';
const SESSION_KEY = 'an_sid';
const OPT_OUT_KEY = 'an_optout';
const DEBUG_KEY = 'an_debug';
const FLUSH_INTERVAL_MS = 10_000;

let buffer: AnalyticsEvent[] = [];
let referrerSent = false;
let timer: ReturnType<typeof setInterval> | null = null;
let listenersBound = false;

/** Guards against double-counting things that should fire once per page. */
const firedOnce = new Set<string>();

/**
 * Tracking is off for the site owner and for anyone who has asked not to be
 * tracked, and off in local development so test clicks never reach production
 * counters. Setting `an_debug` in localStorage overrides the last part.
 */
function isEnabled(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  try {
    if (window.localStorage.getItem(OPT_OUT_KEY) === '1') return false;
    if (window.localStorage.getItem(DEBUG_KEY) === '1') return true;
  } catch {
    // Storage can throw in private modes; that alone is no reason to stop.
  }

  if (navigator.doNotTrack === '1') return false;

  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}

/**
 * A random id per tab, forgotten when the tab closes. It is never joined to
 * anything and only ever reaches a HyperLogLog, which counts distinct values
 * without being able to list them back.
 */
function sessionId(): string | null {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Only external referrers are worth a write; same-site navigation is noise. */
function externalReferrer(): string | undefined {
  const ref = document.referrer;
  if (!ref) return undefined;
  try {
    return new URL(ref).hostname === window.location.hostname ? undefined : ref;
  } catch {
    return undefined;
  }
}

export function flush(): void {
  if (buffer.length === 0) return;

  const id = sessionId();
  if (!id) {
    buffer = [];
    return;
  }

  const payload = JSON.stringify({
    sessionId: id,
    ...(referrerSent ? {} : { referrer: externalReferrer() }),
    events: buffer,
  });

  buffer = [];
  referrerSent = true;

  // A typed Blob keeps the beacon's content type honest; sendBeacon otherwise
  // sends text/plain, which reads as a mislabeled body on the wire.
  const blob = new Blob([payload], { type: 'application/json' });
  if (navigator.sendBeacon?.(ENDPOINT, blob)) return;

  // Older Safari refuses beacons over some conditions; keepalive still delivers
  // during unload, and a dropped analytics batch is not worth retrying.
  void fetch(ENDPOINT, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {});
}

function bindListeners(): void {
  if (listenersBound) return;
  listenersBound = true;

  // `visibilitychange` is the one lifecycle event that reliably fires on mobile
  // when a tab is backgrounded or closed; `pagehide` covers bfcache navigation.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);

  timer = setInterval(flush, FLUSH_INTERVAL_MS);
}

/** Records one event. Safe to call from anywhere, including during render teardown. */
export function track(event: ClientEvent, prop?: string, path?: string): void {
  if (!isEnabled()) return;

  buffer.push({
    event,
    ...(prop ? { prop } : {}),
    path: path ?? window.location.pathname,
  });

  bindListeners();

  // Flushing at the cap rather than dropping keeps a long session from silently
  // losing the events that overflow it.
  if (buffer.length >= MAX_EVENTS_PER_BATCH) flush();
}

/** Records an event at most once per page load, keyed by `${event}:${prop}`. */
export function trackOnce(event: ClientEvent, prop?: string): void {
  const key = `${event}:${prop ?? ''}`;
  if (firedOnce.has(key)) return;
  firedOnce.add(key);
  track(event, prop);
}

/** Clears the per-page dedupe set on client-side navigation. */
export function resetPageState(): void {
  firedOnce.clear();
}

/** Exposed for a teardown path in tests; the listeners otherwise live for the tab. */
export function stopFlushTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

import { redis } from './redis';

// Real concurrency, without a WebSocket server.
//
// Every listener heartbeats on an interval. Each heartbeat writes its session
// id into a Redis sorted set scored by timestamp. Counting "who is here right
// now" is then just: drop anything older than the window, and count what is
// left. A listener who closes the tab simply stops heartbeating and ages out
// of the window on its own, so there is no disconnect event to miss.

/** How long a heartbeat stays valid. Must exceed the client interval. */
export const PRESENCE_WINDOW_MS = 45_000;

/** How often clients should heartbeat. Comfortably inside the window. */
export const HEARTBEAT_INTERVAL_MS = 15_000;

const presenceKey = (stationId: string) => `radio:presence:${stationId}`;
const GLOBAL_KEY = 'radio:presence:all';

/**
 * Records a heartbeat and returns the current live counts.
 * Trims expired members on every call so the set cannot grow unbounded.
 */
export async function heartbeat(stationId: string, sessionId: string) {
  const now = Date.now();
  const cutoff = now - PRESENCE_WINDOW_MS;
  const key = presenceKey(stationId);

  const pipeline = redis.pipeline();
  pipeline.zadd(key, { score: now, member: sessionId });
  pipeline.zremrangebyscore(key, 0, cutoff);
  pipeline.zcard(key);
  // Expire the whole key if the station goes quiet, so idle stations cost nothing.
  pipeline.expire(key, Math.ceil((PRESENCE_WINDOW_MS * 4) / 1000));

  pipeline.zadd(GLOBAL_KEY, { score: now, member: sessionId });
  pipeline.zremrangebyscore(GLOBAL_KEY, 0, cutoff);
  pipeline.zcard(GLOBAL_KEY);
  pipeline.expire(GLOBAL_KEY, Math.ceil((PRESENCE_WINDOW_MS * 4) / 1000));

  const results = await pipeline.exec<
    [number, number, number, number, number, number, number, number]
  >();

  return {
    station: Number(results[2]) || 0,
    total: Number(results[6]) || 0,
  };
}

/** Reads current counts without registering the caller as present. */
export async function readPresence(stationId: string) {
  const cutoff = Date.now() - PRESENCE_WINDOW_MS;
  const key = presenceKey(stationId);

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, cutoff);
  pipeline.zcard(key);
  pipeline.zremrangebyscore(GLOBAL_KEY, 0, cutoff);
  pipeline.zcard(GLOBAL_KEY);

  const results = await pipeline.exec<[number, number, number, number]>();

  return {
    station: Number(results[1]) || 0,
    total: Number(results[3]) || 0,
  };
}

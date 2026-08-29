import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// Titles and channel names for a set of YouTube video ids.
//
// A user playlist arrives from the IFrame player as bare video ids and nothing
// else, so the song list would otherwise read as a column of 11-character
// gibberish. The Data API would answer this in one call but needs a key this
// project does not have, so we use oEmbed, which is public and keyless.
//
// oEmbed is one request per video, which is why this sits behind Redis: a
// playlist of fifty is fifty requests the first time anyone opens it and none
// after that, for anyone. Titles effectively never change, so the entries can
// live a long time.

export const dynamic = 'force-dynamic';

const VIDEO_ID = /^[\w-]{11}$/;
/** Comfortably above a long playlist, low enough to bound the work per call. */
const MAX_IDS = 200;
/** How many oEmbed lookups are in flight at once. */
const CONCURRENCY = 8;
const CACHE_TTL_SECONDS = 90 * 24 * 60 * 60;

interface VideoMeta {
  title: string;
  author: string;
}

const cacheKey = (id: string) => `yt:meta:${id}`;
const playlistCacheKey = (id: string) => `yt:playlist:${id}`;

/** Playlist ids are longer than video ids and use the same alphabet. */
const PLAYLIST_ID = /^[A-Za-z0-9_-]{13,64}$/;

/** A video that is private, deleted or region-locked simply has no metadata. */
async function fetchMeta(id: string): Promise<VideoMeta | null> {
  const target = `https://www.youtube.com/watch?v=${id}`;
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(target)}&format=json`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { title: data.title, author: data.author_name ?? '' };
  } catch {
    return null;
  }
}

/** Runs `worker` over `items` a few at a time rather than all at once. */
async function pooled<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

/** A playlist's own title and channel, so the library can name it. */
async function fetchPlaylistMeta(id: string): Promise<VideoMeta | null> {
  const target = `https://www.youtube.com/playlist?list=${id}`;
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(target)}&format=json`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { title: data.title, author: data.author_name ?? '' };
  } catch {
    return null;
  }
}

async function resolvePlaylists(rawIds: string[]): Promise<Record<string, VideoMeta>> {
  const ids = Array.from(new Set(rawIds.filter((id) => PLAYLIST_ID.test(id)))).slice(0, 20);
  const out: Record<string, VideoMeta> = {};
  if (ids.length === 0) return out;

  let missing = ids;
  try {
    const cached = await redis.mget<(VideoMeta | null)[]>(...ids.map(playlistCacheKey));
    missing = [];
    ids.forEach((id, i) => {
      const hit = cached?.[i];
      if (hit && typeof hit.title === 'string') out[id] = hit;
      else missing.push(id);
    });
  } catch (error) {
    console.error('playlist cache read failed, falling through to oEmbed:', error);
  }

  const fetched: [string, VideoMeta][] = [];
  await pooled(missing, CONCURRENCY, async (id) => {
    const found = await fetchPlaylistMeta(id);
    if (!found) return;
    out[id] = found;
    fetched.push([id, found]);
  });

  if (fetched.length > 0) {
    try {
      const pipeline = redis.pipeline();
      // Shorter than a video title's life: a playlist gets renamed and gains
      // songs far more often than a single upload changes name.
      for (const [id, value] of fetched) {
        pipeline.set(playlistCacheKey(id), value, { ex: 7 * 24 * 60 * 60 });
      }
      await pipeline.exec();
    } catch (error) {
      console.error('playlist cache write failed, serving uncached:', error);
    }
  }
  return out;
}

export async function POST(request: NextRequest) {
  let ids: string[];
  let playlistIds: string[];
  try {
    const body = (await request.json()) as { ids?: unknown; playlists?: unknown };
    if (body.ids !== undefined && !Array.isArray(body.ids)) {
      return NextResponse.json({ success: false, error: 'ids must be an array' }, { status: 400 });
    }
    if (body.playlists !== undefined && !Array.isArray(body.playlists)) {
      return NextResponse.json(
        { success: false, error: 'playlists must be an array' },
        { status: 400 }
      );
    }
    if (body.ids === undefined && body.playlists === undefined) {
      return NextResponse.json(
        { success: false, error: 'ids or playlists is required' },
        { status: 400 }
      );
    }
    ids = Array.from(
      new Set(
        (body.ids ?? []).filter((id): id is string => typeof id === 'string' && VIDEO_ID.test(id))
      )
    ).slice(0, MAX_IDS);
    playlistIds = (body.playlists ?? []).filter((id): id is string => typeof id === 'string');
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const playlists = await resolvePlaylists(playlistIds);

  if (ids.length === 0) {
    return NextResponse.json({ success: true, meta: {}, playlists });
  }

  const meta: Record<string, VideoMeta> = {};
  let missing = ids;

  // Redis being down must not take the playlist down; it just costs lookups.
  try {
    const cached = await redis.mget<(VideoMeta | null)[]>(...ids.map(cacheKey));
    missing = [];
    ids.forEach((id, i) => {
      const hit = cached?.[i];
      if (hit && typeof hit.title === 'string') meta[id] = hit;
      else missing.push(id);
    });
  } catch (error) {
    console.error('youtube-meta cache read failed, falling through to oEmbed:', error);
  }

  const fetched: [string, VideoMeta][] = [];
  await pooled(missing, CONCURRENCY, async (id) => {
    const found = await fetchMeta(id);
    if (!found) return;
    meta[id] = found;
    fetched.push([id, found]);
  });

  if (fetched.length > 0) {
    try {
      const pipeline = redis.pipeline();
      for (const [id, value] of fetched) {
        pipeline.set(cacheKey(id), value, { ex: CACHE_TTL_SECONDS });
      }
      await pipeline.exec();
    } catch (error) {
      console.error('youtube-meta cache write failed, serving uncached:', error);
    }
  }

  return NextResponse.json({ success: true, meta, playlists });
}

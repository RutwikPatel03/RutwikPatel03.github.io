import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/api';

// YouTube search for the radio.
//
// This is the one expensive call on the site. Google allows 100 search.list
// calls per day per project, and that is a hard cap on the method rather than
// a drain on the general 10,000-unit pool — so exhausting it stops search and
// nothing else. Playlist names and video titles cost one unit each out of the
// separate pool and keep working regardless.
//
// Three things keep the 100 going as far as possible: identical queries are
// answered from Redis and never reach Google, a per-IP rate limit stops one
// visitor spending the day's allowance, and the caller is told how many are
// left so the UI can stop offering what it cannot deliver.

export const dynamic = 'force-dynamic';

const MAX_QUERY = 100;
const RESULTS = 12;
/** Google's own daily allowance for this method. */
const DAILY_BUDGET = 100;
/** A person searches a handful of times a minute; a script does not. */
const RATE_LIMIT = 8;
const RATE_WINDOW = 60_000;
/** Results for a given phrase barely change, and a repeat costs nothing. */
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SearchResult {
  videoId: string;
  title: string;
  author: string;
}

/** Same words, same order, same answer — so casing and spacing never cost a call. */
function normalise(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

const cacheKey = (q: string) => `yt:search:${normalise(q)}`;
const budgetKey = () => `yt:search:count:${new Date().toISOString().slice(0, 10)}`;

/** Calls made against today's allowance, without spending one to find out. */
async function usedToday(): Promise<number> {
  try {
    return (await redis.get<number>(budgetKey())) ?? 0;
  } catch {
    // Unknown rather than zero: better to allow the call than to block search
    // because the cache is unreachable.
    return 0;
  }
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').slice(0, MAX_QUERY);
  if (!q.trim()) {
    return NextResponse.json({ success: false, error: 'A search term is required' }, { status: 400 });
  }

  // A cached phrase is free, so it is answered before any limit applies.
  try {
    const hit = await redis.get<SearchResult[]>(cacheKey(q));
    if (Array.isArray(hit)) {
      return NextResponse.json({
        success: true,
        results: hit,
        cached: true,
        remaining: Math.max(0, DAILY_BUDGET - (await usedToday())),
      });
    }
  } catch (error) {
    console.error('search cache read failed, falling through to YouTube:', error);
  }

  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  if (!checkRateLimit(`yt-search:${clientIp}`, RATE_LIMIT, RATE_WINDOW).allowed) {
    return NextResponse.json(
      { success: false, error: 'Searching too fast. Give it a minute.' },
      { status: 429 }
    );
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, error: 'YouTube search is not configured on this deployment.' },
      { status: 503 }
    );
  }

  const used = await usedToday();
  if (used >= DAILY_BUDGET) {
    return NextResponse.json(
      {
        success: false,
        error: "That's all of today's YouTube searches used. Your own music is still searchable.",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  // Anything the embedded player cannot play is worse than no result at all.
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('videoCategoryId', '10'); // Music
  url.searchParams.set('maxResults', String(RESULTS));
  url.searchParams.set('q', q);
  url.searchParams.set('key', key);

  let results: SearchResult[];
  try {
    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { Referer: process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev' },
    });
    // Count the call whatever it returns: Google charges for a failed request
    // too, so not counting it would let errors quietly overrun the budget.
    let remaining = DAILY_BUDGET;
    try {
      const now = await redis.incr(budgetKey());
      // Expire a little past midnight so the counter cannot outlive its day.
      if (now === 1) await redis.expire(budgetKey(), 36 * 60 * 60);
      remaining = Math.max(0, DAILY_BUDGET - now);
    } catch (error) {
      console.error('search budget counter failed:', error);
    }

    if (!res.ok) {
      const reason = res.status === 403 ? 'YouTube refused the search (quota or key).' : 'Search failed.';
      return NextResponse.json({ success: false, error: reason, remaining }, { status: 502 });
    }

    const data = (await res.json()) as {
      items?: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string } }[];
    };
    results = (data.items ?? [])
      .filter((it) => it.id?.videoId && it.snippet?.title)
      .map((it) => ({
        videoId: it.id!.videoId!,
        // Titles arrive HTML-escaped from the API.
        title: (it.snippet!.title ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        author: it.snippet!.channelTitle ?? '',
      }));

    if (results.length > 0) {
      try {
        await redis.set(cacheKey(q), results, { ex: CACHE_TTL_SECONDS });
      } catch (error) {
        console.error('search cache write failed, serving uncached:', error);
      }
    }
    return NextResponse.json({ success: true, results, cached: false, remaining });
  } catch {
    return NextResponse.json({ success: false, error: 'Could not reach YouTube.' }, { status: 502 });
  }
}

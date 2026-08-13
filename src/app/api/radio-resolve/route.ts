import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Writes a resolved video id straight into the catalogue source file, so a
// missing track can be fixed from the player instead of by hand-editing.
//
// Development only. It writes to the repo, which has no business happening on
// a deployed site, so production returns 403 before touching anything.

export const dynamic = 'force-dynamic';

const FILES: Record<string, string> = {
  garba: 'garba.ts',
  saloon: 'bollywood90s.ts',
  gully: 'desiHipHop.ts',
  melody: 'soulful.ts',
};

const DATA_DIR = join(process.cwd(), 'src', 'data', 'radio');
const VIDEO_ID = /^[\w-]{11}$/;

/** Accepts a bare id, watch URL, youtu.be, /embed/, /shorts/, or a Music URL. */
function parseVideoId(input: string): string | null {
  const s = (input || '').trim();
  if (!s) return null;
  if (VIDEO_ID.test(s)) return s;
  const m =
    /[?&]v=([\w-]{11})/.exec(s) ||
    /youtu\.be\/([\w-]{11})/.exec(s) ||
    /\/embed\/([\w-]{11})/.exec(s) ||
    /\/shorts\/([\w-]{11})/.exec(s) ||
    /\/live\/([\w-]{11})/.exec(s);
  return m ? m[1] : null;
}

/** ISO 8601 duration to seconds. */
function durationSeconds(iso: string): number {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

/**
 * Confirms the video exists and is actually usable before it is written.
 * This is the whole point: an id that merely looks right is worthless, and a
 * dead id committed to the catalogue is worse than a missing one.
 */
async function validate(videoId: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return { ok: true, warning: 'YOUTUBE_API_KEY not set, saved without checking' };
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,contentDetails,status');
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', key);

  const res = await fetch(url, {
    headers: { Referer: process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev' },
  });
  if (!res.ok) {
    return { ok: false, error: `YouTube API ${res.status}` };
  }

  const data = await res.json();
  const video = data.items?.[0];
  if (!video) return { ok: false, error: 'That video does not exist' };
  if (video.status?.embeddable !== true) return { ok: false, error: 'Video does not allow embedding' };
  if (video.status?.privacyStatus !== 'public') return { ok: false, error: 'Video is not public' };
  if ((video.contentDetails?.regionRestriction?.blocked || []).includes('IN')) {
    return { ok: false, error: 'Video is blocked in India' };
  }

  const secs = durationSeconds(video.contentDetails?.duration);
  if (secs > 900) return { ok: false, error: `Too long (${Math.round(secs / 60)} min) - probably a compilation` };
  if (secs > 0 && secs < 75) return { ok: false, error: `Too short (${secs}s) - probably a clip` };

  return {
    ok: true,
    videoTitle: video.snippet?.title as string,
    channel: video.snippet?.channelTitle as string,
  };
}

/** Shared guard: this route rewrites repo source files. */
function devOnlyGuard() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Editing the catalogue is disabled in production' },
      { status: 403 }
    );
  }
  return null;
}

// DELETE - drop a track from the catalogue entirely.
//
// For songs with no usable upload anywhere: a permanently silent entry is just
// clutter in the list, so removing it is better than leaving it pending.
export async function DELETE(request: NextRequest) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const body = await request.json().catch(() => ({}));
    const station = String(body.station || '');
    const title = String(body.title || '');

    if (!FILES[station]) {
      return NextResponse.json({ success: false, error: 'Unknown station' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing track title' }, { status: 400 });
    }

    const path = join(DATA_DIR, FILES[station]);
    const src = await readFile(path, 'utf8');

    // Match the whole line so the trailing newline goes with it, leaving no
    // blank gap behind in the source file.
    const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^[ \\t]*\\{[^{}]*title: '${esc}'[^{}]*\\},[ \\t]*\\r?\\n`, 'm');
    if (!re.test(src)) {
      return NextResponse.json(
        { success: false, error: 'Track not found in the catalogue' },
        { status: 400 }
      );
    }

    await writeFile(path, src.replace(re, ''), 'utf8');
    return NextResponse.json({ success: true, removed: title });
  } catch (error) {
    console.error('Failed to remove radio track:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove the track' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  try {
    const body = await request.json().catch(() => ({}));
    const station = String(body.station || '');
    const title = String(body.title || '');
    const raw = String(body.url || '');

    if (!FILES[station]) {
      return NextResponse.json({ success: false, error: 'Unknown station' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing track title' }, { status: 400 });
    }

    const videoId = parseVideoId(raw);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Could not find a video id in that link' },
        { status: 400 }
      );
    }

    const checked = await validate(videoId);
    if (!checked.ok) {
      return NextResponse.json({ success: false, error: checked.error }, { status: 400 });
    }

    const path = join(DATA_DIR, FILES[station]);
    const src = await readFile(path, 'utf8');

    // One id must not serve two songs.
    if (new RegExp(`videoId: '${videoId}'`).test(src)) {
      return NextResponse.json(
        { success: false, error: 'That video is already used by another track' },
        { status: 400 }
      );
    }

    const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(\\{[^{}]*title: '${esc}'[^{}]*?)videoId: null`, 'm');
    if (!re.test(src)) {
      return NextResponse.json(
        { success: false, error: 'Track not found, or it already has a video' },
        { status: 400 }
      );
    }

    await writeFile(path, src.replace(re, `$1videoId: '${videoId}'`), 'utf8');

    return NextResponse.json({
      success: true,
      videoId,
      videoTitle: checked.videoTitle,
      channel: checked.channel,
      warning: checked.warning,
    });
  } catch (error) {
    console.error('Failed to resolve radio track:', error);
    return NextResponse.json({ success: false, error: 'Failed to write the track' }, { status: 500 });
  }
}

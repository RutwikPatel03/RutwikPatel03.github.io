#!/usr/bin/env node
/**
 * Closes out the tracks automated matching cannot reach.
 *
 * Three ways in, in increasing order of effort:
 *
 *   1. --playlist <url|id>   Mine any YouTube / YouTube Music playlist for the
 *                            station's pending tracks. Cheapest by far: one
 *                            good rotation can close dozens at 1 quota unit
 *                            per 50 videos.
 *
 *   2. (no flag)             Write a worksheet listing every pending track with
 *                            a ready-made YouTube search link. Paste a URL or
 *                            id into the last column of the rows you want.
 *
 *   3. --apply               Read the worksheet back, verify each id is real,
 *                            embeddable, not region-blocked and a plausible
 *                            length, then write it into the catalogue.
 *
 * Usage:
 *   node scripts/fill-pending.mjs --station melody
 *   YOUTUBE_API_KEY=... node scripts/fill-pending.mjs --station melody --playlist "https://music.youtube.com/playlist?list=PLxxxx"
 *   YOUTUBE_API_KEY=... node scripts/fill-pending.mjs --station melody --apply
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data', 'radio');
const CACHE_DIR = join(__dirname, '.cache');

const FILES = {
  garba: 'garba.ts',
  saloon: 'bollywood90s.ts',
  gully: 'desiHipHop.ts',
  melody: 'soulful.ts',
};

const args = process.argv.slice(2);
const STATION = args.includes('--station') ? args[args.indexOf('--station') + 1] : null;
const APPLY = args.includes('--apply');
const PLAYLIST = args.includes('--playlist') ? args[args.indexOf('--playlist') + 1] : null;
const API_KEY = process.env.YOUTUBE_API_KEY;
const REFERER = process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev';

if (!STATION || !FILES[STATION]) {
  console.error(`Usage: --station <${Object.keys(FILES).join('|')}> [--playlist <url>] [--apply]`);
  process.exit(1);
}

const sheetPath = () => join(CACHE_DIR, `pending-${STATION}.tsv`);

async function api(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: API_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Referer: REFERER } });
  if (!res.ok) throw new Error(`${endpoint} ${res.status}: ${(await res.text()).slice(0, 160)}`);
  return res.json();
}

/** Accepts a bare id, a watch URL, a youtu.be link, or a Music URL. */
function parseVideoId(input) {
  const s = (input || '').trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    /[?&]v=([\w-]{11})/.exec(s) ||
    /youtu\.be\/([\w-]{11})/.exec(s) ||
    /\/embed\/([\w-]{11})/.exec(s) ||
    /\/shorts\/([\w-]{11})/.exec(s);
  return m ? m[1] : null;
}

/** Accepts a playlist URL or a bare list id. */
function parsePlaylistId(input) {
  const s = (input || '').trim();
  const m = /[?&]list=([\w-]+)/.exec(s);
  if (m) return m[1];
  return /^[\w-]{12,}$/.test(s) ? s : null;
}

/** Reads the station's tracks straight out of the data file. */
async function readTracks() {
  const path = join(DATA_DIR, FILES[STATION]);
  const src = await readFile(path, 'utf8');
  const tracks = [];
  for (const m of src.matchAll(/\{\s*title:\s*'((?:[^'\\]|\\.)*)'[^}]*?\}/g)) {
    const block = m[0];
    tracks.push({
      title: m[1].replace(/\\'/g, "'"),
      artist: /artist:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '',
      album: /album:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '',
      year: /year:\s*(\d{4})/.exec(block)?.[1] ?? '',
      resolved: !/videoId:\s*null/.test(block),
    });
  }
  return { path, src, tracks };
}

/** Writes a videoId into the entry whose title matches. */
function patch(src, title, videoId) {
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(\\{[^{}]*title:\\s*'${esc}'[^{}]*?)videoId:\\s*null`, 'm');
  return src.replace(re, `$1videoId: '${videoId}'`);
}

/** Confirms an id is usable before it lands in the catalogue. */
async function validate(ids) {
  const ok = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const data = await api('videos', {
      part: 'snippet,contentDetails,status',
      id: ids.slice(i, i + 50).join(','),
    });
    for (const v of data.items || []) {
      const iso = v.contentDetails?.duration || '';
      const t = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
      const secs = t ? Number(t[1] || 0) * 3600 + Number(t[2] || 0) * 60 + Number(t[3] || 0) : 0;
      const blocked = v.contentDetails?.regionRestriction?.blocked || [];
      const reasons = [];
      if (v.status?.embeddable !== true) reasons.push('not embeddable');
      if (v.status?.privacyStatus !== 'public') reasons.push('not public');
      if (blocked.includes('IN')) reasons.push('blocked in IN');
      if (secs > 900) reasons.push(`too long (${Math.round(secs / 60)}m)`);
      if (secs > 0 && secs < 75) reasons.push(`too short (${secs}s)`);
      ok.set(v.id, { reasons, title: v.snippet?.title, channel: v.snippet?.channelTitle });
    }
  }
  return ok;
}

// ---------------------------------------------------------------- playlist
async function fromPlaylist() {
  if (!API_KEY) {
    console.error('Missing YOUTUBE_API_KEY.');
    process.exit(1);
  }
  const listId = parsePlaylistId(PLAYLIST);
  if (!listId) {
    console.error(`Could not read a playlist id out of "${PLAYLIST}".`);
    process.exit(1);
  }

  const videos = [];
  let token;
  do {
    const data = await api('playlistItems', {
      part: 'snippet',
      playlistId: listId,
      maxResults: '50',
      ...(token ? { pageToken: token } : {}),
    });
    for (const item of data.items || []) {
      const id = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title || '';
      if (!id || title === 'Private video' || title === 'Deleted video') continue;
      videos.push({ id, title, channel: item.snippet?.videoOwnerChannelTitle || '' });
    }
    token = data.nextPageToken;
  } while (token);

  console.log(`Playlist ${listId}: ${videos.length} videos`);

  const { path, src, tracks } = await readTracks();
  const pending = tracks.filter((t) => !t.resolved);
  const claimed = new Set([...src.matchAll(/videoId:\s*'([\w-]{11})'/g)].map((m) => m[1]));

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  let out = src;
  const hits = [];

  for (const track of pending) {
    const nt = norm(track.title);
    if (nt.length < 4) continue;
    const cand = videos.find((v) => {
      if (claimed.has(v.id)) return false;
      const nv = norm(v.title);
      if (!nv.includes(nt)) return false;
      // The film, when known, has to appear too: same-titled songs are rife,
      // and this is the only thing separating one "Tum Ho" from another.
      if (track.album && !nv.includes(norm(track.album))) return false;
      return true;
    });
    if (!cand) continue;
    hits.push({ track, cand });
    claimed.add(cand.id);
  }

  if (hits.length === 0) {
    console.log('No pending tracks matched this playlist.');
    return;
  }

  const ids = hits.map((h) => h.cand.id);
  const checked = await validate(ids);

  let written = 0;
  for (const { track, cand } of hits) {
    const info = checked.get(cand.id);
    if (!info) {
      console.log(`  skip  ${track.title} - video not retrievable`);
      continue;
    }
    if (info.reasons.length) {
      console.log(`  skip  ${track.title} - ${info.reasons.join(', ')}`);
      continue;
    }
    out = patch(out, track.title, cand.id);
    written++;
    console.log(`  ok    ${track.title} -> ${cand.id}  ${info.title.slice(0, 50)}`);
  }

  await writeFile(path, out, 'utf8');
  console.log(`\nWrote ${written} of ${pending.length} pending tracks.`);
}

// --------------------------------------------------------------- worksheet
async function writeSheet() {
  const { tracks } = await readTracks();
  const pending = tracks.filter((t) => !t.resolved);
  await mkdir(CACHE_DIR, { recursive: true });

  const lines = [
    '# Paste a YouTube URL or 11-char id into the last column, then run:',
    `#   YOUTUBE_API_KEY=... node scripts/fill-pending.mjs --station ${STATION} --apply`,
    '# Leave a row blank to skip it. Lines starting with # are ignored.',
    '#',
    ['TITLE', 'ARTIST', 'FILM', 'YEAR', 'SEARCH', 'PASTE_URL_OR_ID'].join('\t'),
  ];

  for (const t of pending) {
    const q = [t.title, t.artist.split(',')[0], t.album, 'official'].filter(Boolean).join(' ');
    const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    lines.push([t.title, t.artist, t.album, t.year, search, ''].join('\t'));
  }

  await writeFile(sheetPath(), lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${pending.length} pending tracks to:\n  ${sheetPath()}`);
  console.log('\nOpen it, click the SEARCH link for any row, paste the video URL');
  console.log('into the last column, save, then re-run with --apply.');
}

// ------------------------------------------------------------------- apply
async function applySheet() {
  if (!API_KEY) {
    console.error('Missing YOUTUBE_API_KEY.');
    process.exit(1);
  }
  const raw = await readFile(sheetPath(), 'utf8').catch(() => null);
  if (!raw) {
    console.error(`No worksheet at ${sheetPath()}. Run without --apply first.`);
    process.exit(1);
  }

  const rows = raw
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split('\t'))
    .filter((c) => c[0] && c[0] !== 'TITLE');

  const filled = [];
  for (const cols of rows) {
    const id = parseVideoId(cols[5]);
    if (id) filled.push({ title: cols[0], id });
  }

  if (filled.length === 0) {
    console.log('No rows have a URL or id filled in yet.');
    return;
  }

  console.log(`Validating ${filled.length} pasted ids...`);
  const checked = await validate(filled.map((f) => f.id));

  const { path, src } = await readTracks();
  let out = src;
  let written = 0;

  for (const { title, id } of filled) {
    const info = checked.get(id);
    if (!info) {
      console.log(`  FAIL  ${title} - ${id} not found`);
      continue;
    }
    if (info.reasons.length) {
      console.log(`  FAIL  ${title} - ${info.reasons.join(', ')}`);
      continue;
    }
    const before = out;
    out = patch(out, title, id);
    if (out === before) {
      console.log(`  SKIP  ${title} - already resolved or title not found`);
      continue;
    }
    written++;
    console.log(`  ok    ${title} -> ${id}  (${info.channel})`);
  }

  await writeFile(path, out, 'utf8');
  console.log(`\nWrote ${written} tracks into ${FILES[STATION]}.`);
}

if (PLAYLIST) await fromPlaylist();
else if (APPLY) await applySheet();
else await writeSheet();

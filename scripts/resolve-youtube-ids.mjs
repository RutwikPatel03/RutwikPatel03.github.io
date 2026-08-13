#!/usr/bin/env node
/**
 * Resolves radio track metadata to real, embeddable YouTube video ids.
 *
 * Track files store `videoId: null` until this runs. For each unresolved
 * track it searches the YouTube Data API, then verifies the top candidates
 * with videos.list to confirm the video is embeddable and not region-blocked
 * in India. The first candidate that passes wins, and the track file is
 * rewritten in place.
 *
 * Nothing here downloads or stores audio. We only ever record an id that
 * points at the rights holder's own upload, so playback runs through
 * YouTube's player and counts as a normal view for them.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... node scripts/resolve-youtube-ids.mjs
 *   YOUTUBE_API_KEY=... node scripts/resolve-youtube-ids.mjs --station garba
 *   YOUTUBE_API_KEY=... node scripts/resolve-youtube-ids.mjs --dry-run
 *   YOUTUBE_API_KEY=... node scripts/resolve-youtube-ids.mjs --force
 *
 * Quota: search.list costs 100 units per call, videos.list costs 1. The free
 * daily quota is 10,000 units, so about 95 unresolved tracks per day. The
 * script is resumable: already-resolved tracks are skipped unless --force.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data', 'radio');

const FILES = {
  garba: 'garba.ts',
  saloon: 'bollywood90s.ts',
  gully: 'desiHipHop.ts',
  melody: 'soulful.ts',
};

const API_KEY = process.env.YOUTUBE_API_KEY;
/**
 * Keys restricted by HTTP referrer reject requests with no Referer header,
 * which is every CLI request. Send the site's own origin so a browser-scoped
 * key still works from here. Must match the key's allowed pattern: for
 * `*.rutwik.dev` that means a subdomain, since the bare apex does not match.
 */
const REFERER = process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev';
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const ONLY = args.includes('--station') ? args[args.indexOf('--station') + 1] : null;

if (!API_KEY) {
  console.error(
    'Missing YOUTUBE_API_KEY.\n' +
      'Create one at https://console.cloud.google.com/apis/credentials\n' +
      '(enable "YouTube Data API v3"), then re-run:\n' +
      '  YOUTUBE_API_KEY=xxx node scripts/resolve-youtube-ids.mjs'
  );
  process.exit(1);
}

/** Channels we trust to be the official rights holder upload. */
const PREFERRED_CHANNELS = [
  't-series',
  'sony music india',
  'zee music company',
  'saregama',
  'tips official',
  'tips music',
  'yrf',
  'yash raj films',
  'shemaroo',
  'venus',
  'eros now',
  'speed records',
  'universal music india',
  'times music',
  'red ribbon',
  'def jam india',
  'mass appeal india',
  'gully gang',
  'coke studio',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: API_KEY })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { Referer: REFERER } });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403 && body.includes('quotaExceeded')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (res.status === 403 && body.includes('referer')) {
      throw new Error(
        `REFERER_BLOCKED: the key rejected "${REFERER}". Set YOUTUBE_API_REFERER to a value ` +
          `matching the key's HTTP-referrer restriction, or remove the restriction.`
      );
    }
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** Normalises for loose comparison: lowercase, strip everything but a-z0-9. */
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Hard gate: the candidate's title must actually contain the song title.
 *
 * Scoring alone is not enough. A well-known label channel with a high score
 * could win with zero title overlap, which is how a search for one song
 * returns a completely different one. A missing track is recoverable; a
 * confidently wrong one is not, because nothing downstream will ever question
 * it. So refuse instead of guessing.
 */
function titleMatches(videoTitle, track) {
  const nT = norm(track.title);
  const nV = norm(videoTitle);
  if (!nT) return false;
  if (nV.includes(nT)) return true;
  // Tolerate transliteration drift on longer titles by requiring a solid
  // leading chunk rather than the whole string.
  if (nT.length > 12) {
    const head = nT.slice(0, Math.ceil(nT.length * 0.7));
    return nV.includes(head);
  }
  return false;
}

/** Builds the search query for a track. */
function queryFor(track) {
  const bits = [track.title, track.artist];
  if (track.album) bits.push(track.album);
  bits.push('full song');
  return bits.join(' ');
}

/** Scores a candidate so official uploads outrank fan re-uploads. */
function score(item, track) {
  const channel = (item.snippet.channelTitle || '').toLowerCase();
  const title = (item.snippet.title || '').toLowerCase();
  let s = 0;
  if (PREFERRED_CHANNELS.some((c) => channel.includes(c))) s += 50;
  if (channel.includes('official') || title.includes('official')) s += 15;
  if (title.includes(track.title.toLowerCase())) s += 20;
  if (track.artist && title.includes(track.artist.split(',')[0].toLowerCase().trim())) s += 10;
  // Penalise the things that are not the song itself.
  for (const bad of ['cover', 'karaoke', 'instrumental', 'reaction', 'lyrics video', 'remix', 'mashup', 'slowed', 'reverb', 'ringtone']) {
    if (title.includes(bad)) s -= 30;
  }
  // Compilations match many different queries and would otherwise get handed
  // to several tracks at once, so every one of them plays the same audio while
  // the UI claims a different song. Push them below any single-song upload.
  for (const comp of ['jukebox', 'nonstop', 'non stop', 'non-stop', 'full album', 'all songs', 'medley', 'mashup', 'best of', 'top 10', 'top 20', 'collection', 'back to back', 'superhit songs', 'hit songs', 'audio songs', 'video songs']) {
    if (title.includes(comp)) s -= 80;
  }
  return s;
}

async function resolveTrack(track, claimed) {
  const search = await api('search', {
    part: 'snippet',
    q: queryFor(track),
    type: 'video',
    videoCategoryId: '10', // Music
    maxResults: '8',
regionCode: 'IN',
  });

  const candidates = (search.items || [])
    // Drop anything whose title is not actually this song before ranking.
    .filter((item) => titleMatches(item.snippet?.title || '', track))
    .map((item) => ({ item, s: score(item, track) }))
    .sort((a, b) => b.s - a.s)
    .map(({ item }) => item.id.videoId)
    .filter(Boolean)
    // A video already claimed by an earlier track is almost always a
    // compilation upload. Handing it out twice would make two different
    // songs play identical audio, so drop it and take the next candidate.
    .filter((id) => !claimed.has(id));

  if (candidates.length === 0) return { videoId: null, unplayable: true };

  // Verify embeddability in one batched call.
  const details = await api('videos', {
    part: 'status,contentDetails,snippet',
    id: candidates.join(','),
  });

  const byId = new Map((details.items || []).map((v) => [v.id, v]));
  for (const id of candidates) {
    const v = byId.get(id);
    if (!v) continue;
    if (v.status?.embeddable !== true) continue;
    if (v.status?.privacyStatus !== 'public') continue;
    const blocked = v.contentDetails?.regionRestriction?.blocked || [];
    if (blocked.includes('IN')) continue;
    const allowed = v.contentDetails?.regionRestriction?.allowed;
    if (allowed && !allowed.includes('IN')) continue;
    return { videoId: id, resolvedTitle: v.snippet?.title, channel: v.snippet?.channelTitle };
  }

  return { videoId: null, unplayable: true };
}

/**
 * Rewrites `videoId: null` for a specific track in the source file.
 * Matches on the exact title string so ordering changes cannot misalign it.
 */
function patchSource(src, title, videoId, unplayable) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match the whole entry, so an already-marked track can be rewritten rather
  // than appended to. Matching only `videoId: null` meant a second run stacked
  // another `unplayable: true` onto the same object, and a duplicate property
  // is a TypeScript error that fails the build.
  const entryRe = new RegExp(`\\{[^{}]*title:\\s*'${escaped}'[^{}]*\\}`, 'm');
  const entry = entryRe.exec(src)?.[0];
  if (!entry) return src;

  let updated = entry
    // Drop any previous marker before writing the new state.
    .replace(/,\s*unplayable:\s*(?:true|false)/g, '')
    .replace(/videoId:\s*(?:null|'[\w-]{11}')/, unplayable ? 'videoId: null' : `videoId: '${videoId}'`);

  if (unplayable) {
    updated = updated.replace(/videoId: null/, 'videoId: null, unplayable: true');
  }

  return src.replace(entryRe, updated);
}

async function run() {
  const targets = ONLY ? { [ONLY]: FILES[ONLY] } : FILES;
  if (ONLY && !FILES[ONLY]) {
    console.error(`Unknown station "${ONLY}". Options: ${Object.keys(FILES).join(', ')}`);
    process.exit(1);
  }

  let resolved = 0;
  let failed = 0;
  let quotaHit = false;

  // Video ids already committed anywhere in the catalogue. Seeded across every
  // station (not just the ones being resolved now) so a compilation upload
  // cannot be claimed twice across separate runs.
  const claimed = new Set();
  for (const file of Object.values(FILES)) {
    const existing = await readFile(join(DATA_DIR, file), 'utf8').catch(() => '');
    for (const m of existing.matchAll(/videoId:\s*'([\w-]{11})'/g)) claimed.add(m[1]);
  }

  for (const [stationId, file] of Object.entries(targets)) {
    const path = join(DATA_DIR, file);
    let src = await readFile(path, 'utf8');

    // Pull out every track literal so we know titles and current state.
    const trackRe = /\{\s*title:\s*'((?:[^'\\]|\\.)*)'[^}]*?\}/g;
    const tracks = [];
    for (const m of src.matchAll(trackRe)) {
      const block = m[0];
      tracks.push({
        title: m[1].replace(/\\'/g, "'"),
        artist: /artist:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '',
        album: /album:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1],
        isResolved: !/videoId:\s*null/.test(block),
      });
    }

    const pending = tracks.filter((t) => FORCE || !t.isResolved);
    console.log(`\n[${stationId}] ${tracks.length} tracks, ${pending.length} to resolve`);

    for (const track of pending) {
      if (quotaHit) break;
      try {
        const result = await resolveTrack(track, claimed);
        if (result.videoId) {
          claimed.add(result.videoId);
          src = patchSource(src, track.title, result.videoId, false);
          resolved++;
          console.log(`  ok   ${track.title} -> ${result.videoId}  (${result.channel})`);
        } else {
          src = patchSource(src, track.title, null, true);
          failed++;
          console.log(`  MISS ${track.title} - no embeddable official upload`);
        }
      } catch (err) {
        if (err.message === 'QUOTA_EXCEEDED') {
          console.warn('\nDaily quota exhausted. Progress is saved; re-run tomorrow to continue.');
          quotaHit = true;
          break;
        }
        console.error(`  ERR  ${track.title}: ${err.message}`);
        failed++;
      }
      await sleep(120); // stay well under the per-second rate limit
    }

    if (!DRY_RUN) {
      await writeFile(path, src, 'utf8');
    }
  }

  console.log(
    `\nDone. resolved=${resolved} unresolved=${failed}${DRY_RUN ? ' (dry run, nothing written)' : ''}`
  );
  if (quotaHit) process.exitCode = 2;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

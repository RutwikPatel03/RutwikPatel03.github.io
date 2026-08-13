#!/usr/bin/env node
/**
 * Audits already-resolved video ids and flags the ones that are probably the
 * wrong song.
 *
 * The resolver picks a match by ranking search results, which is a guess. This
 * script fetches what each committed id actually *is* and checks it against the
 * track it was assigned to, so bad matches surface as a review list instead of
 * as a listener hearing the wrong song.
 *
 * Cheap by design: videos.list costs 1 quota unit and takes 50 ids per call,
 * so auditing the whole catalogue costs single-digit units.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... node scripts/verify-youtube-ids.mjs
 *   YOUTUBE_API_KEY=... node scripts/verify-youtube-ids.mjs --station garba
 *   YOUTUBE_API_KEY=... node scripts/verify-youtube-ids.mjs --flagged-only
 *   YOUTUBE_API_KEY=... node scripts/verify-youtube-ids.mjs --clear-flagged
 *
 * --clear-flagged resets suspect tracks back to `videoId: null` so a later
 * resolver run can try again, rather than leaving a wrong song in rotation.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data', 'radio');
const CACHE_DIR = join(__dirname, '.cache');
/**
 * Video ids this audit has rejected, so the matcher can skip them next run.
 * Without this, clearing a bad id and re-matching just re-picks the same
 * candidate: the loop has to remember what it already ruled out.
 */
const REJECTED_PATH = join(CACHE_DIR, 'rejected.json');

const FILES = {
  garba: 'garba.ts',
  saloon: 'bollywood90s.ts',
  gully: 'desiHipHop.ts',
  melody: 'soulful.ts',
};

const API_KEY = process.env.YOUTUBE_API_KEY;
const REFERER = process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev';
const args = process.argv.slice(2);
const ONLY = args.includes('--station') ? args[args.indexOf('--station') + 1] : null;
const FLAGGED_ONLY = args.includes('--flagged-only');
const CLEAR_FLAGGED = args.includes('--clear-flagged');

if (!API_KEY) {
  console.error('Missing YOUTUBE_API_KEY.');
  process.exit(1);
}

const OFFICIAL_HINTS = [
  't-series', 'sony music', 'zee music', 'saregama', 'tips', 'yrf', 'yash raj',
  'shemaroo', 'venus', 'eros', 'speed records', 'universal music', 'times music',
  'coke studio', 'gully gang', 'mass appeal', 'rajshri', 'official',
  'ultra bollywood', 'ultra movie', 'revibe', 'incink', 'vevo',
  'ishtar', 'venus movies', 'shemaroo', 'zee music classic', 'ultra',
];

/** Channels that signal a re-upload rather than the rights holder. */
const SUSPECT_CHANNEL_HINTS = ['8d', 'lofi', 'lo-fi', 'slowed', 'reverb', 'dj ', 'remix', 'status', 'shorts'];

/**
 * Normalises for loose comparison: lowercase, fold stylised characters, then
 * strip punctuation and spaces.
 *
 * Rap names lean on leetspeak, and simply deleting the symbol breaks the
 * comparison: "KR$NA" stripped becomes "krna", which does not match the
 * channel "KRSNA". Fold the substitutions back to letters first.
 */
function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[^a-z0-9]/g, '');
}

/** ISO 8601 duration -> seconds. */
function parseDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function api(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: API_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Referer: REFERER } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** Returns a list of reasons this pairing looks wrong. Empty means it passes. */
function audit(track, video) {
  const reasons = [];
  if (!video) {
    reasons.push('video not found (deleted or private)');
    return reasons;
  }

  const vTitle = video.snippet?.title || '';
  const channel = video.snippet?.channelTitle || '';
  const secs = parseDuration(video.contentDetails?.duration);

  // Does the video title actually contain the song title?
  const nT = norm(track.title);
  const nV = norm(vTitle);
  if (nT.length > 6 && !nV.includes(nT)) {
    // Allow a partial match on the first significant chunk.
    const head = nT.slice(0, Math.max(8, Math.floor(nT.length * 0.6)));
    if (!nV.includes(head)) reasons.push(`title mismatch (video: "${vTitle.slice(0, 60)}")`);
  }

  // Duration sanity. A single song is roughly 1.5 to 10 minutes.
  if (secs > 900) reasons.push(`too long (${fmt(secs)}) - likely a compilation or jukebox`);
  else if (secs > 0 && secs < 75) reasons.push(`too short (${fmt(secs)}) - likely a clip or teaser`);

  // Channel reputation. An artist's own channel is the most authoritative
  // source there is, so match the credited artist against the channel name
  // before falling back to the label whitelist.
  const lc = channel.toLowerCase();
  const firstArtist = norm((track.artist || '').split(',')[0]);
  const isArtistOwnChannel =
    firstArtist.length > 4 && firstArtist !== 'traditional' && norm(channel).includes(firstArtist);

  if (SUSPECT_CHANNEL_HINTS.some((h) => lc.includes(h))) {
    reasons.push(`suspect channel "${channel}"`);
  } else if (
    !isArtistOwnChannel &&
    !OFFICIAL_HINTS.some((h) => lc.includes(h)) &&
    !lc.endsWith('- topic')
  ) {
    reasons.push(`unrecognised channel "${channel}"`);
  }

  // Artist cross-check: does the video mention the credited artist at all?
  //
  // Skipped when the upload is on the artist's own channel, and skipped for
  // film songs whose film is confirmed in the title. Label uploads of playback
  // songs are titled "Song | Film | Actors" and routinely omit the singer, so
  // demanding the singer's name there flags correct matches as broken.
  const album = norm(track.album || '');
  const filmConfirmed = album.length > 3 && norm(vTitle).includes(album);

  if (
    !isArtistOwnChannel &&
    !filmConfirmed &&
    firstArtist.length > 5 &&
    firstArtist !== 'traditional'
  ) {
    if (!norm(vTitle + channel).includes(firstArtist)) {
      reasons.push(`artist "${track.artist.split(',')[0].trim()}" not mentioned`);
    }
  }

  return reasons;
}

async function run() {
  const targets = ONLY ? { [ONLY]: FILES[ONLY] } : FILES;
  if (ONLY && !FILES[ONLY]) {
    console.error(`Unknown station "${ONLY}". Options: ${Object.keys(FILES).join(', ')}`);
    process.exit(1);
  }

  let totalChecked = 0;
  let totalFlagged = 0;
  let calls = 0;

  for (const [stationId, file] of Object.entries(targets)) {
    const path = join(DATA_DIR, file);
    let src = await readFile(path, 'utf8');

    const tracks = [];
    for (const m of src.matchAll(/\{\s*title:\s*'((?:[^'\\]|\\.)*)'[^}]*?\}/g)) {
      const block = m[0];
      const id = /videoId:\s*'([\w-]{11})'/.exec(block)?.[1];
      if (!id) continue;
      tracks.push({
        title: m[1].replace(/\\'/g, "'"),
        artist: /artist:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '',
        // Needed by the film-confirmation check in audit(); without it every
        // playback song gets flagged for not naming its singer.
        album: /album:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1],
        videoId: id,
      });
    }

    if (tracks.length === 0) {
      console.log(`\n[${stationId}] nothing resolved yet, skipping`);
      continue;
    }

    // Batch 50 ids per call.
    const byId = new Map();
    for (let i = 0; i < tracks.length; i += 50) {
      const batch = tracks.slice(i, i + 50);
      const data = await api('videos', {
        part: 'snippet,contentDetails,status',
        id: batch.map((t) => t.videoId).join(','),
      });
      calls++;
      for (const v of data.items || []) byId.set(v.id, v);
    }

    console.log(`\n[${stationId}] verified ${tracks.length} resolved tracks`);
    const flaggedTitles = [];

    for (const track of tracks) {
      const video = byId.get(track.videoId);
      const reasons = audit(track, video);
      totalChecked++;
      if (reasons.length === 0) {
        if (!FLAGGED_ONLY) {
          console.log(`  ok    ${track.title}`);
        }
      } else {
        totalFlagged++;
        flaggedTitles.push(track.title);
        console.log(`  FLAG  ${track.title}`);
        for (const r of reasons) console.log(`          - ${r}`);
      }
    }

    if (CLEAR_FLAGGED && flaggedTitles.length) {
      // Remember the ids being removed so the matcher does not hand back the
      // same candidate on the next pass.
      await mkdir(CACHE_DIR, { recursive: true });
      const prior = JSON.parse(await readFile(REJECTED_PATH, 'utf8').catch(() => '[]'));
      const rejected = new Set(prior);
      for (const title of flaggedTitles) {
        const t = tracks.find((x) => x.title === title);
        if (t?.videoId) rejected.add(t.videoId);
      }
      await writeFile(REJECTED_PATH, JSON.stringify([...rejected]), 'utf8');
      console.log(`  -> blocklist now holds ${rejected.size} rejected ids`);

      for (const title of flaggedTitles) {
        const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(\\{[^{}]*title:\\s*'${esc}'[^{}]*?)videoId:\\s*'[\\w-]{11}'`, 'm');
        src = src.replace(re, `$1videoId: null`);
      }
      await writeFile(path, src, 'utf8');
      console.log(`  -> cleared ${flaggedTitles.length} flagged ids back to null`);
    }
  }

  console.log(
    `\nChecked ${totalChecked}, flagged ${totalFlagged} (${
      totalChecked ? Math.round((totalFlagged / totalChecked) * 100) : 0
    }%). Quota used: ~${calls} units.`
  );
  if (totalFlagged && !CLEAR_FLAGGED) {
    console.log('Re-run with --clear-flagged to reset those to null for another resolver pass.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

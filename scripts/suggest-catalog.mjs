#!/usr/bin/env node
/**
 * Mines the cached pool for clean single-song uploads and prints them as
 * ready-to-paste RadioTrack entries.
 *
 * This inverts the original mistake. Writing titles from memory and then
 * hunting for them produces entries for songs that do not exist ("Chal Chaiya
 * Re"), and no amount of matching can rescue those. Deriving the catalogue
 * from real uploads instead means every track is guaranteed to exist, to be
 * spelled the way the rights holder spells it, and to already have its id.
 *
 * Costs nothing and touches no network.
 *
 * Usage:
 *   node scripts/suggest-catalog.mjs --station garba
 *   node scripts/suggest-catalog.mjs --station garba --channel "Saregama Gujarati"
 *   node scripts/suggest-catalog.mjs --station garba --limit 80
 *   node scripts/suggest-catalog.mjs --station garba --channels   # list channels
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { NON_SONG_MARKERS } from './sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '.cache');

const args = process.argv.slice(2);
const STATION = args.includes('--station') ? args[args.indexOf('--station') + 1] : 'garba';
const CHANNEL = args.includes('--channel') ? args[args.indexOf('--channel') + 1] : null;
const LIST_CHANNELS = args.includes('--channels');
const LIMIT = Number(args.includes('--limit') ? args[args.indexOf('--limit') + 1] : 60);

/**
 * Pulls the song name out of a YouTube title.
 *
 * Uploads follow a few stable shapes:
 *   "Artist - Song (Official Video) | Label"
 *   "Song | Artist | Film"
 *   "Song (Official Lyric Video) | Artist"
 * Take the segment before the first pipe, drop bracketed decoration, then if
 * an " - " remains treat the right side as the song and the left as artist.
 */
function extract(rawTitle) {
  let s = rawTitle.split('|')[0];
  s = s.replace(/[([{][^)\]}]*[)\]}]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  let artist = null;
  let title = s;

  const dash = s.split(/\s+[-–—]\s+/);
  if (dash.length === 2) {
    // "Falguni Pathak - Maine Payal Hai Chhankai"
    [artist, title] = dash;
  } else {
    // "Falguni Pathak- Meri Chunar Udd Udd Jaye" (no space before dash)
    const tight = s.match(/^(.{3,30}?)-\s*(.+)$/);
    if (tight) [, artist, title] = tight;
  }

  title = (title || '').replace(/\s+/g, ' ').trim().replace(/[.,;:]+$/, '');
  artist = artist ? artist.replace(/\s+/g, ' ').trim() : null;
  return { title, artist };
}

function isNonSong(title) {
  const lc = title.toLowerCase();
  return NON_SONG_MARKERS.some((m) => lc.includes(m));
}

/** Rough quality signal: real song uploads have short, clean names. */
function looksLikeSong(title) {
  if (!title) return false;
  const words = title.split(' ').filter(Boolean);
  if (words.length < 1 || words.length > 8) return false;
  if (title.length > 60) return false;
  // Reject titles that are mostly non-Latin punctuation soup or numerics.
  if (/^\d+$/.test(title)) return false;
  return true;
}

function esc(s) {
  return s.replace(/'/g, "\\'");
}

async function run() {
  const raw = await readFile(join(CACHE_DIR, `pool-${STATION}.json`), 'utf8').catch(() => null);
  if (!raw) {
    console.error(`No pool for "${STATION}". Run: node scripts/fetch-pool.mjs --station ${STATION}`);
    process.exit(1);
  }
  const videos = JSON.parse(raw).videos;

  if (LIST_CHANNELS) {
    const counts = new Map();
    for (const v of videos) counts.set(v.channel, (counts.get(v.channel) || 0) + 1);
    for (const [c, n] of [...counts].sort((a, b) => b[1] - a[1])) {
      console.log(`${String(n).padStart(5)}  ${c}`);
    }
    return;
  }

  const seenTitle = new Set();
  const out = [];

  for (const v of videos) {
    if (CHANNEL && !(v.channel || '').toLowerCase().includes(CHANNEL.toLowerCase())) continue;
    if (isNonSong(v.title)) continue;

    const { title, artist } = extract(v.title);
    if (!looksLikeSong(title)) continue;

    const key = title.toLowerCase();
    if (seenTitle.has(key)) continue;
    seenTitle.add(key);

    out.push({ title, artist: artist || v.channel, videoId: v.videoId, channel: v.channel });
    if (out.length >= LIMIT) break;
  }

  console.log(`// ${out.length} candidates mined from the ${STATION} pool`);
  console.log(`// Every id below is a real upload; review the titles and keep what belongs.\n`);
  for (const t of out) {
    console.log(
      `  { title: '${esc(t.title)}', artist: '${esc(t.artist)}', videoId: '${t.videoId}' },` +
        `  // ${t.channel}`
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

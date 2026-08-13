#!/usr/bin/env node
/**
 * Phase 1: build a local pool of real video ids from official channels and
 * curated playlists.
 *
 * This is the cheap half. playlistItems.list returns 50 videos for 1 quota
 * unit, so a pool of several thousand videos costs well under a hundred units,
 * against the 100-units-per-song that searching would cost. The pool is cached
 * to disk so phase 2 (matching) can run as many times as needed for free.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... node scripts/fetch-pool.mjs --station garba
 *   YOUTUBE_API_KEY=... node scripts/fetch-pool.mjs                 # all
 *   YOUTUBE_API_KEY=... node scripts/fetch-pool.mjs --station garba --discover
 *   node scripts/fetch-pool.mjs --station garba --stats              # no API
 *
 * --discover spends 100 units per query to find candidate playlists, printing
 * ids worth pasting into scripts/sources.mjs permanently.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { SOURCES } from './sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '.cache');

const API_KEY = process.env.YOUTUBE_API_KEY;
const REFERER = process.env.YOUTUBE_API_REFERER || 'https://www.rutwik.dev';
const args = process.argv.slice(2);
const ONLY = args.includes('--station') ? args[args.indexOf('--station') + 1] : null;
const DISCOVER = args.includes('--discover');
const STATS_ONLY = args.includes('--stats');
/** Cap pages per source so a huge label channel cannot eat the whole quota. */
const MAX_PAGES = Number(
  args.includes('--max-pages') ? args[args.indexOf('--max-pages') + 1] : 12
);

let quotaUsed = 0;

async function api(endpoint, params, cost) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries({ ...params, key: API_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Referer: REFERER } });
  quotaUsed += cost;
  if (!res.ok) {
    const body = await res.text();
    if (body.includes('quotaExceeded')) throw new Error('QUOTA_EXCEEDED');
    throw new Error(`${endpoint} ${res.status}: ${body.slice(0, 180)}`);
  }
  return res.json();
}

/** @handle -> uploads playlist id. */
async function uploadsPlaylistFor(handle) {
  const data = await api('channels', { part: 'contentDetails,snippet', forHandle: handle }, 1);
  const item = (data.items || [])[0];
  if (!item) return null;
  return {
    playlistId: item.contentDetails?.relatedPlaylists?.uploads,
    title: item.snippet?.title,
  };
}

/** Pulls up to MAX_PAGES * 50 videos from a playlist. */
async function pullPlaylist(playlistId, label) {
  const out = [];
  let pageToken;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await api(
      'playlistItems',
      {
        part: 'snippet',
        playlistId,
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      },
      1
    );
    for (const item of data.items || []) {
      const vid = item.snippet?.resourceId?.videoId;
      if (!vid) continue;
      // Private/deleted entries keep a slot but carry no usable title.
      const title = item.snippet?.title || '';
      if (title === 'Private video' || title === 'Deleted video') continue;
      out.push({
        videoId: vid,
        title,
        channel: item.snippet?.videoOwnerChannelTitle || label || '',
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

async function discoverPlaylists(queries) {
  for (const q of queries) {
    try {
      const data = await api(
        'search',
        { part: 'snippet', q, type: 'playlist', maxResults: '5' },
        100
      );
      console.log(`\n  discover "${q}":`);
      for (const item of data.items || []) {
        console.log(
          `    ${item.id.playlistId}  ${item.snippet.title.slice(0, 55)}  (${item.snippet.channelTitle})`
        );
      }
    } catch (err) {
      console.log(`  discover "${q}" failed: ${err.message}`);
    }
  }
}

async function run() {
  const stations = ONLY ? [ONLY] : Object.keys(SOURCES);
  if (ONLY && !SOURCES[ONLY]) {
    console.error(`Unknown station "${ONLY}". Options: ${Object.keys(SOURCES).join(', ')}`);
    process.exit(1);
  }

  await mkdir(CACHE_DIR, { recursive: true });

  for (const station of stations) {
    const cachePath = join(CACHE_DIR, `pool-${station}.json`);

    if (STATS_ONLY) {
      const raw = await readFile(cachePath, 'utf8').catch(() => null);
      if (!raw) {
        console.log(`[${station}] no pool cached yet`);
        continue;
      }
      const pool = JSON.parse(raw);
      const channels = new Map();
      for (const v of pool.videos) channels.set(v.channel, (channels.get(v.channel) || 0) + 1);
      console.log(`\n[${station}] ${pool.videos.length} videos from ${channels.size} channels`);
      for (const [c, n] of [...channels].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
        console.log(`   ${String(n).padStart(5)}  ${c}`);
      }
      continue;
    }

    if (!API_KEY) {
      console.error('Missing YOUTUBE_API_KEY.');
      process.exit(1);
    }

    const cfg = SOURCES[station];
    console.log(`\n[${station}] building pool`);

    if (DISCOVER) {
      await discoverPlaylists(cfg.discover || []);
      continue;
    }

    // Start from whatever is already cached so repeated runs accumulate
    // rather than refetching everything.
    const existing = await readFile(cachePath, 'utf8').catch(() => null);
    const seen = new Map();
    if (existing) {
      for (const v of JSON.parse(existing).videos) seen.set(v.videoId, v);
    }
    const before = seen.size;

    const playlists = [...(cfg.playlists || [])];

    for (const handle of cfg.channels || []) {
      try {
        const info = await uploadsPlaylistFor(handle);
        if (!info?.playlistId) {
          console.log(`  skip @${handle} (channel not found)`);
          continue;
        }
        console.log(`  @${handle} -> ${info.title}`);
        playlists.push(info.playlistId);
      } catch (err) {
        if (err.message === 'QUOTA_EXCEEDED') throw err;
        console.log(`  skip @${handle} (${err.message.slice(0, 60)})`);
      }
    }

    for (const pid of playlists) {
      try {
        const vids = await pullPlaylist(pid);
        let added = 0;
        for (const v of vids) {
          if (!seen.has(v.videoId)) {
            seen.set(v.videoId, v);
            added++;
          }
        }
        console.log(`  ${pid}: ${vids.length} items, +${added} new`);
      } catch (err) {
        if (err.message === 'QUOTA_EXCEEDED') {
          console.warn('  quota exhausted; saving what we have');
          break;
        }
        console.log(`  ${pid} failed: ${err.message.slice(0, 80)}`);
      }
    }

    await writeFile(
      cachePath,
      JSON.stringify({ station, fetchedAt: new Date().toISOString(), videos: [...seen.values()] }, null, 0),
      'utf8'
    );
    console.log(`  pool: ${before} -> ${seen.size} videos  (cached at ${cachePath})`);
  }

  if (!STATS_ONLY) console.log(`\nQuota used this run: ~${quotaUsed} units.`);
}

run().catch((err) => {
  console.error(err.message === 'QUOTA_EXCEEDED' ? 'Daily quota exhausted.' : err);
  process.exit(1);
});

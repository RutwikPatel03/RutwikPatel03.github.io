#!/usr/bin/env node
/**
 * Phase 2: match the curated catalogue against the cached video pool.
 *
 * Costs nothing and touches no network, so it can be re-run and re-tuned
 * freely. Because every candidate came from an official channel or a curated
 * playlist, a confident title match is a correct id by construction, which is
 * the whole reason this beats searching per song.
 *
 * Anything it cannot match confidently is left as null and printed. That list
 * is worth reading: it is the set of tracks whose titles may simply be wrong
 * in the catalogue.
 *
 * Usage:
 *   node scripts/match-pool.mjs --station garba --dry-run
 *   node scripts/match-pool.mjs --station garba
 *   node scripts/match-pool.mjs --station garba --threshold 0.85
 *   node scripts/match-pool.mjs --station garba --show-candidates
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { TRUSTED_CHANNEL_HINTS, NON_SONG_MARKERS } from './sources.mjs';

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
const ONLY = args.includes('--station') ? args[args.indexOf('--station') + 1] : null;
const DRY_RUN = args.includes('--dry-run');
const SHOW_CANDIDATES = args.includes('--show-candidates');
const FORCE = args.includes('--force');
const THRESHOLD = Number(
  args.includes('--threshold') ? args[args.indexOf('--threshold') + 1] : 0.8
);
/**
 * Extra cached pools to search alongside the station's own, comma separated.
 * Songs do not respect station boundaries: the Hindi-film garba crossovers sit
 * on the Hindi label channels, which the saloon and melody pools already hold,
 * so re-fetching 50k videos into the garba pool would be pure waste.
 */
const EXTRA_POOLS = (args.includes('--extra-pools')
  ? args[args.indexOf('--extra-pools') + 1]
  : ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Strips the packaging YouTube titles carry so only the song name is left. */
function cleanTitle(raw) {
  return (
    raw
      // Drop bracketed decoration: (Official Video), [HD], etc.
      .replace(/[([{][^)\]}]*[)\]}]/g, ' ')
      // Drop everything after a pipe, which is nearly always channel branding.
      .split('|')[0]
      // Common suffixes that survive the above.
      .replace(
        /\b(official|music|video|audio|song|full|hd|4k|lyrical|lyrics|new|latest|20\d\d)\b/gi,
        ' '
      )
      .toLowerCase()
      // Keep only letters/digits/spaces; transliteration punctuation varies wildly.
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function tokens(s) {
  return cleanTitle(s).split(' ').filter((t) => t.length > 1);
}

/**
 * Tokenises the whole title, keeping everything after the pipes.
 *
 * Uploads are formatted "Song | Film | Cast | Singer | Label", so cleanTitle
 * deliberately cuts at the first pipe to isolate the song name. The film and
 * artist live in the part it discards, so corroborating those needs the full
 * string or the check silently compares against text that cannot contain them.
 */
function fullTokens(s) {
  return (s || '')
    .replace(/[([{][^)\]}]*[)\]}]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t.length > 1);
}

/** Levenshtein, capped early: transliteration drifts by a letter or two. */
function editDistance(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

/**
 * True when two tokens are the same word allowing for spelling drift.
 *
 * Tolerance is deliberately mean. Transliterated Indian song titles are full
 * of near-collisions that are entirely different songs - kamariya/savariya,
 * dholida/dhola, laadki/ladki - so anything looser than this matches the wrong
 * track with total confidence. Short words get no slack at all, because a
 * one-character edit on a five-letter word is usually a different word.
 */
function tokenMatches(a, b) {
  if (a === b) return true;
  const tolerance = a.length <= 6 ? 0 : a.length <= 9 ? 1 : 2;
  if (tolerance === 0) return false;
  return editDistance(a, b) <= tolerance;
}

/**
 * Fraction of the track's title tokens present in the video title.
 * 1.0 means every word of the song name appears.
 */
function coverage(trackTokens, videoTokens) {
  if (trackTokens.length === 0) return 0;
  let hits = 0;
  for (const t of trackTokens) {
    if (videoTokens.some((v) => tokenMatches(t, v))) hits++;
  }
  return hits / trackTokens.length;
}

function isNonSong(title) {
  const lc = title.toLowerCase();
  return NON_SONG_MARKERS.some((m) => lc.includes(m));
}

/**
 * True when the track's words appear in the video title consecutively and in
 * order, allowing per-word spelling drift.
 *
 * Order-agnostic coverage is not enough: "Tari Yaad" and "Yaad Tari Aave" share
 * every word but are different songs. Requiring an adjacent, ordered run is
 * what separates the song from a title that merely mentions the same words.
 */
function containsSequence(trackTokens, videoTokens) {
  if (trackTokens.length === 0) return false;
  const span = videoTokens.length - trackTokens.length;
  for (let start = 0; start <= span; start++) {
    let ok = true;
    for (let i = 0; i < trackTokens.length; i++) {
      if (!tokenMatches(trackTokens[i], videoTokens[start + i])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function scoreCandidate(track, video, trackTokens) {
  if (video.nonSong) return { score: 0, cov: 0 };

  const vTokens = video.t;
  const cov = coverage(trackTokens, vTokens);
  if (cov < THRESHOLD) return { score: 0, cov };

  // The words must run together in order, not merely all be present somewhere.
  if (!containsSequence(trackTokens, vTokens)) return { score: 0, cov };

  // Dilution gate. After stripping "official/video/audio" noise, a studio
  // upload is mostly artist plus song name. A short title buried in a long one
  // is a live set or a compilation entry: "Laadki" inside "LAADKI With mobile
  // flashlights at Ramgarhia Centre" is not the record.
  const dilution = trackTokens.length / Math.max(vTokens.length, 1);
  if (dilution < 0.4) return { score: 0, cov };

  // Film gate. Hindi film songs reuse titles constantly - there is a "Tum Ho"
  // in Rockstar and another in Babloo Bachelor, a "Teri Meri" in Bodyguard and
  // another in Gabbar Is Back. Uploads nearly always name the film, so when the
  // catalogue knows it, require it. Without this the matcher picks confidently
  // and wrongly between same-named songs.
  const albumTokens = tokens(track.album || '');
  let albumCov = 0;
  if (albumTokens.length) {
    albumCov = coverage(albumTokens, video.full);
    if (albumCov < 0.6) return { score: 0, cov };
  }

  // Corroboration reads the whole title, since film/artist/label sit after the
  // pipes that cleanTitle strips.
  const artistTokens = tokens(track.artist || '');
  const artistCov = artistTokens.length ? coverage(artistTokens, video.hay) : 0;

  // Film corroboration, needed by the single-token rule below as well as the
  // gate further down.
  const albumTokensEarly = tokens(track.album || '');
  const albumCovEarly = albumTokensEarly.length
    ? coverage(albumTokensEarly, video.full)
    : 0;

  // A one-word title carries no redundancy: a single loose hit scores a
  // perfect 1.00, which is how "Kamariya" matched "O Savariya". Demand an
  // exact word plus independent corroboration before trusting a match that
  // thin. Either the artist or the film will do - film uploads are titled
  // "Song | Film | Cast" and routinely omit the playback singer, so requiring
  // the singer alone rejected correct matches like Banjaara from Ek Villain.
  if (trackTokens.length === 1) {
    const exact = vTokens.some((v) => v === trackTokens[0]);
    if (!exact) return { score: 0, cov };
    if (artistCov < 0.5 && albumCovEarly < 0.6) return { score: 0, cov };
  }

  let score = cov * 100;

  // Tighter matches rank higher, on top of the gate above.
  score += dilution * 20;

  // Artist corroboration, computed above against title and channel together.
  score += artistCov * 25;

  // A confirmed film is the strongest signal available for playback songs.
  score += albumCov * 30;

  const ch = (video.channel || '').toLowerCase();
  if (TRUSTED_CHANNEL_HINTS.some((h) => ch.includes(h))) score += 15;

  return { score, cov };
}

async function run() {
  const targets = ONLY ? { [ONLY]: FILES[ONLY] } : FILES;
  if (ONLY && !FILES[ONLY]) {
    console.error(`Unknown station "${ONLY}". Options: ${Object.keys(FILES).join(', ')}`);
    process.exit(1);
  }

  let matched = 0;
  let unmatched = 0;

  for (const [station, file] of Object.entries(targets)) {
    const ownRaw = await readFile(join(CACHE_DIR, `pool-${station}.json`), 'utf8').catch(() => null);
    if (!ownRaw) {
      console.log(`\n[${station}] no pool cached. Run: node scripts/fetch-pool.mjs --station ${station}`);
      continue;
    }

    // Merge in any extra pools, de-duplicated by video id.
    const merged = new Map();
    for (const v of JSON.parse(ownRaw).videos) merged.set(v.videoId, v);
    for (const extra of EXTRA_POOLS) {
      const raw = await readFile(join(CACHE_DIR, `pool-${extra}.json`), 'utf8').catch(() => null);
      if (!raw) {
        console.log(`  (extra pool "${extra}" not cached, skipping)`);
        continue;
      }
      let added = 0;
      for (const v of JSON.parse(raw).videos) {
        if (!merged.has(v.videoId)) {
          merged.set(v.videoId, v);
          added++;
        }
      }
      console.log(`  (+${added} videos from the ${extra} pool)`);
    }
    const poolRaw = JSON.stringify({ videos: [...merged.values()] });
    // Pre-tokenise once. Tokenising inside the per-track loop meant every one
    // of the ~50k pool titles was re-parsed for every track in the catalogue,
    // which is millions of redundant passes and turns a fast job into a hang.
    const pool = JSON.parse(poolRaw).videos.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      channel: v.channel,
      nonSong: isNonSong(v.title),
      t: tokens(v.title),
      full: fullTokens(v.title),
      hay: [...fullTokens(v.title), ...fullTokens(v.channel || '')],
    }));

    const path = join(DATA_DIR, file);
    let src = await readFile(path, 'utf8');

    const tracks = [];
    for (const m of src.matchAll(/\{\s*title:\s*'((?:[^'\\]|\\.)*)'[^}]*?\}/g)) {
      const block = m[0];
      tracks.push({
        title: m[1].replace(/\\'/g, "'"),
        artist: /artist:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '',
        // The film name is the disambiguator between same-titled songs, so it
        // has to be read here or the film gate in scoreCandidate never fires.
        album: /album:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1],
        resolved: !/videoId:\s*null/.test(block),
      });
    }

    const pending = tracks.filter((t) => FORCE || !t.resolved);
    console.log(`\n[${station}] pool=${pool.length} videos, ${pending.length} tracks to match`);

    // One id must not serve two songs.
    const claimed = new Set();
    for (const m of src.matchAll(/videoId:\s*'([\w-]{11})'/g)) claimed.add(m[1]);

    // Ids the audit has already rejected (wrong song, clip, compilation).
    // Treating them as claimed makes a re-run pick the next candidate instead
    // of handing back the same reject the verifier just removed.
    const rejected = JSON.parse(
      await readFile(join(CACHE_DIR, 'rejected.json'), 'utf8').catch(() => '[]')
    );
    for (const id of rejected) claimed.add(id);
    if (rejected.length) console.log(`  (skipping ${rejected.length} previously rejected ids)`);

    const misses = [];

    for (const track of pending) {
      const tTokens = tokens(track.title);
      const ranked = [];
      for (const video of pool) {
        if (claimed.has(video.videoId)) continue;
        const { score, cov } = scoreCandidate(track, video, tTokens);
        if (score > 0) ranked.push({ video, score, cov });
      }
      ranked.sort((a, b) => b.score - a.score);

      if (ranked.length === 0) {
        unmatched++;
        misses.push(track.title);
        console.log(`  MISS  ${track.title}`);
        continue;
      }

      const best = ranked[0];
      claimed.add(best.video.videoId);
      matched++;
      console.log(
        `  ok    ${track.title}  ->  ${best.video.videoId}  [${best.cov.toFixed(2)}]  ${best.video.title.slice(0, 52)}`
      );
      if (SHOW_CANDIDATES) {
        for (const r of ranked.slice(1, 4)) {
          console.log(`          alt  ${r.video.videoId}  [${r.cov.toFixed(2)}]  ${r.video.title.slice(0, 52)}`);
        }
      }

      const esc = track.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(\\{[^{}]*title:\\s*'${esc}'[^{}]*?)videoId:\\s*(?:null|'[\\w-]{11}')`, 'm');
      src = src.replace(re, `$1videoId: '${best.video.videoId}'`);
    }

    if (!DRY_RUN) await writeFile(path, src, 'utf8');

    if (misses.length) {
      console.log(`\n  Unmatched in ${station} (${misses.length}) - check these titles are real:`);
      for (const t of misses) console.log(`    - ${t}`);
    }
  }

  console.log(
    `\nDone. matched=${matched} unmatched=${unmatched}${DRY_RUN ? ' (dry run, nothing written)' : ''}`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

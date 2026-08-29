import type { RadioStation, RadioTrack, RadioRotation, RotationId } from '@/types/radio';
import { garbaTracks } from './garba';
import { bollywood90sTracks } from './bollywood90s';
import { desiHipHopTracks } from './desiHipHop';
import { soulfulTracks } from './soulful';

export const stations: RadioStation[] = [
  {
    id: 'saloon',
    name: 'Saloon 90s',
    shortName: 'Saloon',
    script: '९० का दशक',
    tagline: 'Cassette-era Hindi film music',
    description:
      'The songs that played in ₹20 barbershops, truck cabins and highway dhabas. Roughly 1988 to 2001, back when the radio picked for you.',
    theme: { shade: '#2b1a12', sand: '#f2e3cf', accent: '#e8804a' },
    tracks: bollywood90sTracks,
    // Day-parted so the station changes character depending on when you tune in.
    rotations: [
      {
        id: 'shaadi',
        name: 'Shaadi & Sunday',
        description: 'Wedding-procession energy: the loud, happy side of the same decade.',
        startHour: 5,
        endHour: 9,
      },
      {
        id: 'classics',
        name: 'Saloon Classics',
        description:
          'The mid-tempo melodies that play in every small-town barbershop, all day long.',
        startHour: 9,
        endHour: 18,
      },
      {
        id: 'dard',
        name: '90s Dard',
        description: 'The heartbreak half of the nineties: slow, melodic, completely unembarrassed.',
        startHour: 18,
        endHour: 22,
      },
      {
        id: 'raat',
        name: 'Highway Raat',
        description: 'Late-night listening for long empty roads: distance, separation, letters home.',
        startHour: 22,
        endHour: 5,
      },
    ],
  },
  {
    id: 'garba',
    name: 'Garba Ground',
    shortName: 'Garba',
    script: 'ગરબા',
    tagline: 'Gujarati folk, raas and navratri',
    description:
      'Nine nights in a loop. Falguni Pathak, traditional raas, and the new Gujarati wave from Aditya Gadhvi to the Coke Studio crossover.',
    theme: { shade: '#1b1033', sand: '#ffe9c9', accent: '#ff5c8a' },
    tracks: garbaTracks,
  },
  {
    id: 'melody',
    name: 'Late Night Melody',
    shortName: 'Melody',
    script: 'मेलोडी',
    tagline: 'Soulful Hindi, Arijit to KK',
    description:
      'The headphones-at-1am rotation. Arijit, KK, Mohit Chauhan, Atif, and the Pritam and Mithoon songbook that defined a decade of heartbreak.',
    theme: { shade: '#0f1a24', sand: '#dde8f2', accent: '#5aa9e6' },
    tracks: soulfulTracks,
  },
  {
    id: 'gully',
    name: 'Gully Frequency',
    shortName: 'Gully',
    script: 'गली',
    tagline: 'Indian hip-hop and rap',
    description:
      'Mumbai gully to Delhi technical. KR$NA, Seedhe Maut, DIVINE, MC Stan, and the Punjabi crossover that took it mainstream.',
    theme: { shade: '#12120f', sand: '#eef0e6', accent: '#c6f24e' },
    tracks: desiHipHopTracks,
  },
];

export const DEFAULT_STATION_ID = 'saloon';

// ===========================================
// The listener's own playlist
// ===========================================

export const PLAYLIST_STATION_ID = 'mine';

/**
 * A fifth station backed by a YouTube playlist the listener names, rather than
 * by a curated list.
 *
 * It ships with no tracks on purpose. A playlist cannot be enumerated without
 * the Data API, so the ids arrive from the player itself once it has loaded
 * the list, which also keeps this station out of the catalogue counts.
 */
export const playlistStation: RadioStation = {
  id: PLAYLIST_STATION_ID,
  name: 'My Playlist',
    shortName: 'Playlist',
  script: 'मेरी',
  tagline: 'Your own YouTube playlist',
  description:
    'Any public or unlisted YouTube playlist of yours, played through the same radio. Private playlists cannot be embedded, so those will not load.',
  theme: { shade: '#191026', sand: '#efe4fb', accent: '#a970ff' },
  tracks: [],
};

/** Everything the station switcher offers, curated plus the listener's own. */
export const allStations: RadioStation[] = [...stations, playlistStation];

export function getStation(id: string | undefined | null): RadioStation {
  return allStations.find((s) => s.id === id) ?? stations[0];
}

/** A YouTube playlist id out of a full URL, or a bare id. */
export function parsePlaylistId(input: string): string | null {
  const value = (input || '').trim();
  if (!value) return null;
  const fromUrl = /[?&]list=([A-Za-z0-9_-]+)/.exec(value);
  const candidate = fromUrl ? fromUrl[1] : value;
  // Ids run from about 13 characters (LL/WL) upward; anything shorter is a
  // video id or a typo, and would fail silently inside the player.
  return /^[A-Za-z0-9_-]{13,}$/.test(candidate) ? candidate : null;
}

/** Tracks that actually have a resolved, embeddable video id. */
export function playableTracks(station: RadioStation): RadioTrack[] {
  return station.tracks.filter((t) => t.videoId && !t.unplayable);
}

export const totalTrackCount = stations.reduce((n, s) => n + s.tracks.length, 0);

// ===========================================
// Rotations
// ===========================================

/** True when `hour` falls inside the rotation's slot, handling midnight wrap. */
export function rotationCoversHour(rotation: RadioRotation, hour: number): boolean {
  const { startHour, endHour } = rotation;
  return startHour <= endHour
    ? hour >= startHour && hour < endHour
    : hour >= startHour || hour < endHour;
}

/** Current hour in IST, regardless of where the listener actually is. */
export function currentHourIST(now: Date = new Date()): number {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.getHours();
}

/**
 * The rotation that "should" be on air right now. Falls back to the first
 * rotation if the slots ever leave a gap.
 */
export function rotationForNow(station: RadioStation, now: Date = new Date()): RadioRotation | null {
  if (!station.rotations?.length) return null;
  const hour = currentHourIST(now);
  return station.rotations.find((r) => rotationCoversHour(r, hour)) ?? station.rotations[0];
}

/** Tracks belonging to a rotation. Passing null returns the whole station. */
export function tracksForRotation(
  station: RadioStation,
  rotationId: RotationId | null
): RadioTrack[] {
  if (!rotationId) return station.tracks;
  return station.tracks.filter((t) => t.moods?.includes(rotationId));
}

/** How many tracks sit in each rotation, for the picker. */
export function rotationCounts(station: RadioStation): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const rotation of station.rotations ?? []) {
    counts[rotation.id] = tracksForRotation(station, rotation.id).length;
  }
  return counts;
}

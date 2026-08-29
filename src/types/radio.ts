// ===========================================
// Radio Types
// ===========================================
// The radio hosts no audio. Each track stores only the metadata needed to
// identify a song plus the YouTube video id its official upload lives at, so
// playback runs through YouTube's own embedded player and plays count as
// normal views for the rights holders.

/**
 * Mood rotations within a station. A station plays all its tracks; a rotation
 * is a filtered slice of them, day-parted so the station changes character
 * depending on when you tune in.
 */
export type RotationId = 'classics' | 'raat' | 'dard' | 'shaadi';

/** A curated song. `videoId` is filled in by scripts/resolve-youtube-ids.mjs. */
export interface RadioTrack {
  /** Song title as credited on the official release. */
  title: string;
  /** Primary performing artist(s). For film songs, the playback singer(s). */
  artist: string;
  /** Film, album, or project the song is from. Omitted for standalone singles. */
  album?: string;
  /** Year of release. */
  year?: number;
  /**
   * YouTube video id (11 chars) for the official upload.
   * `null` means unresolved: the resolver has not run, or it found no
   * embeddable official upload. Unresolved tracks are skipped at play time.
   */
  videoId: string | null;
  /**
   * Set by the resolver when YouTube reports the video as not embeddable or
   * region-blocked, so we can report on them without dropping the curation.
   */
  unplayable?: boolean;
  /**
   * Which mood rotations this song belongs to. A song can sit in more than one
   * (a wedding song is often also a barbershop staple). Tracks with no moods
   * only ever play in the station's full rotation.
   */
  moods?: RotationId[];
}

/** A day-parted mood rotation inside a station. */
export interface RadioRotation {
  id: RotationId;
  name: string;
  description: string;
  /** Start hour in IST, inclusive, 0-23. */
  startHour: number;
  /** End hour in IST, exclusive, 0-23. Wraps past midnight when end < start. */
  endHour: number;
}

/** A themed rotation. One station is one continuous "channel". */
export interface RadioStation {
  /** URL-safe id, used in the ?station= query param. */
  id: string;
  /** Display name. */
  name: string;
  /**
   * A one-word label for tight spots, such as the phone's prev/next strip
   * where three station names have to share one line. Falls back to `name`.
   */
  shortName?: string;
  /** Short line shown under the name. */
  tagline: string;
  /** Longer description used for the station picker and SEO. */
  description: string;
  /** Devanagari/Gujarati script label, shown as a typographic accent. */
  script?: string;
  /** Tailwind-compatible CSS colour values driving the station's palette. */
  theme: {
    /** Page background, deepest shade. */
    shade: string;
    /** Primary text/foreground over the backdrop. */
    sand: string;
    /** Accent used for the live dot, active states, and highlights. */
    accent: string;
  };
  tracks: RadioTrack[];
  /** Optional mood rotations. Stations without these just play everything. */
  rotations?: RadioRotation[];
  /**
   * Optional illustration behind the player. Omit it and the station falls
   * back to its generated CSS/SVG motif, so artwork can be added one station
   * at a time without the page ever looking half-finished.
   */
  backdrop?: {
    /** Path under /public, e.g. '/myimg/radio/saloon.jpg'. */
    src: string;
    /** Narrow-viewport crop. Falls back to `src` when absent. */
    mobileSrc?: string;
    /** Described for screen readers only when the art carries meaning. */
    alt?: string;
    /** 0-1. Lower values let the station colour dominate. Defaults to 0.55. */
    opacity?: number;
    /** CSS object-position, for steering the crop. Defaults to 'center'. */
    position?: string;
  };
}

// ===========================================
// Saved playlists
// ===========================================
// The listener's own YouTube playlists. These live on the server rather than
// in the browser, so they survive a refresh, follow you between devices, and
// are part of the site for everyone.

export interface SavedTrack {
  videoId: string;
  title: string;
  artist: string;
}

export interface SavedPlaylist {
  /** YouTube playlist id. */
  id: string;
  /** Playlist title from YouTube, falling back to the id until it resolves. */
  name: string;
  /** Channel the playlist belongs to. */
  author?: string;
  /**
   * The playlist's own cover art, when YouTube will tell us about it. Absent
   * for playlists resolved without a Data API key, where the library falls
   * back to a mosaic of the first four songs' thumbnails.
   */
  image?: string;
  addedAt: number;
  /**
   * The songs, cached.
   *
   * A playlist's contents otherwise only exist inside the YouTube player,
   * which does not exist until something is playing — which is why, before
   * this, every reload showed an empty station until you pressed play.
   */
  tracks: SavedTrack[];
}

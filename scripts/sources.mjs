/**
 * Where real video ids come from.
 *
 * Searching per song costs 100 quota units and returns a guess. Pulling a
 * channel's uploads feed or a curated playlist costs 1 unit per 50 videos and
 * returns ids that are correct by construction: a label's own upload of a song
 * is that song. So we build a local pool from these sources once, then match
 * the catalogue against it offline for free.
 *
 * `channels` are resolved by @handle to their uploads playlist.
 * `playlists` are used directly.
 * `discover` queries are a last resort: they cost 100 units each and are only
 * run with --discover, to find playlists worth adding here permanently.
 */

export const SOURCES = {
  garba: {
    channels: [
      'adityagadhvi',
      'kirtidangadhviofficial',
      'saregamagujarati',
      'zeemusicgujarati',
      'tseriesgujarati',
      'gujaratifilmsongs',
    ],
    playlists: [
      // Falguni Pathak official uploads (Universal / Revibe)
      'PLBKzzWUn97oY8K8V4PjsMPXg59gHN5-jD',
    ],
    discover: [
      'garba songs official playlist',
      'gujarati folk songs official',
      'navratri garba official audio',
    ],
  },

  saloon: {
    // The big label channels hold 10k-27k videos each. Their uploads feed only
    // reaches the cassette era if paginated all the way back, which is cheap:
    // 1 unit per 50 videos means all of T-Series costs ~540 units. Run these
    // with a high --max-pages; the curated playlists below fill the gaps.
    channels: ['tseries', 'tipsofficial', 'ultrabollywood', 'SonyMusicIndia'],
    playlists: [
      'PL6VikFWYkZntNpRxnSSuCz_p_ZKJppWg8', // Kumar Sanu Hits (T-Series Bollywood Classics)
      'PLinVjP-aRmluiFicvkJtzUsm18L556cpK', // Kumar Sanu 90's Hits (Tips Official)
      'PLinVjP-aRmluPYn9ddwTQTi49uF25JHjb', // Alka Yagnik Hit Songs (Tips Official)
      'PLinVjP-aRmlv0kGeovQ8YLMkTlb__VDh4', // Back In Time Of 90's (Tips Official)
      // A hand-picked cassette-era rotation. Densely on-theme compared with the
      // label feeds, where 90s tracks are buried under tens of thousands of
      // recent uploads.
      'PLTJ1PnzCWyFw',
    ],
    discover: [
      '90s hindi songs official playlist',
      'kumar sanu hits official',
      'alka yagnik 90s hits official',
      'udit narayan 90s songs official',
    ],
  },

  melody: {
    channels: [
      'KKtheofficial',
      'mohitchauhanofficial',
      'AtifAslam',
      'SonuNigam',
      // Same reasoning as saloon: paginate the big labels all the way back.
      'tseries',
      'zeemusiccompany',
      'SonyMusicIndia',
      'tipsofficial',
    ],
    playlists: [
      'PL0Z67tlyTaWq7xmJYR0Im1fwtIhc0T0_6', // Best Of Arijit Singh (Zee Music Company)
      'PLHuHXHyLu7BHw2wHWJoXlf4iSs_e1d23b', // Super-Hit songs of Mohit Chauhan (Sony Music India)
      'PLCED13FD23D44CFB5', // Atif Aslam Hits (Tips Official)
      'PL9bw4S5ePsEHcK0RTdOP76pWRnycVI-Lu', // Best Of Atif Aslam (T-Series)
      // Composer- and mood-led label playlists. Labels group by composer and
      // film far more reliably than by playback singer, which is where the
      // pending Mithoon / Pritam / Bhatt-songbook tracks actually live.
      'PL9bw4S5ePsEH7wn5q7hElilgETS1019J2', // Best of Mithoon (T-Series)
      'PLHuHXHyLu7BERcFEBU0DsVbC4peTloPbA', // Best Of Pritam (Sony Music India)
      'PLHuHXHyLu7BGiVIV7r3FC5s7ZZB7hG7_O', // Top Emraan Hashmi Love Songs (Sony Music India)
      'PLHuHXHyLu7BEWMBq3KixWN8xTAFlkE-Tx', // Romantic Hindi Hits (Sony Music India)
      'PL0Z67tlyTaWphlJ8dod2fSFGmBlUW_KJJ', // Most Romantic Bollywood Songs (Zee Music Company)
      'PL0Z67tlyTaWo9e1BgMx-QfBS1_NqnnAhf', // Bollywood Romantic Songs (Zee Music Company)
      'PL0Z67tlyTaWqvFaH1xvw5eOFpW1_uaVX1', // Bollywood Top 20 Romantic Songs (Zee Music Company)
      'PL9bw4S5ePsEGpT9PdWJYN8joMa2eWAxJf', // Bollywood Romance: Romantic Hits (T-Series)
    ],
    discover: [
      // Aimed at the composers and film catalogues the pending tracks sit in,
      // rather than at singers: labels organise playlists by composer and film
      // far more consistently than by playback singer.
      'Mithoon songs official playlist T-Series',
      'Pritam romantic songs official playlist',
      'Emraan Hashmi hit songs official playlist',
      'KK best songs T-Series official',
      'Zee Music Company romantic hits playlist',
      'Sony Music India bollywood romantic playlist',
    ],
  },

  gully: {
    channels: [
      'krsnaofficial',
      'seedhemaut',
      'emiwaybantai',
      // Verified handles. @divineofficial resolves but its uploads feed 404s;
      // @VIVIANDIVINE is DIVINE's working channel.
      'VIVIANDIVINE',
      'gullygang',
      // DIVINE's own channel keeps mostly teasers and live clips; the studio
      // catalogue sits with his label. Azadi Records is Prabh Deep's.
      'MassAppealIndia',
      'AzadiRecords',
      'Hanumankind',
      'SidhuMooseWalaOfficial',
      'RaftaarMusic',
      'badshahlive',
    ],
    playlists: [],
    discover: [
      'desi hip hop official playlist',
      'indian rap official songs',
    ],
  },
};

/** Channel titles we treat as authoritative when scoring a match. */
export const TRUSTED_CHANNEL_HINTS = [
  't-series', 'sony music', 'zee music', 'saregama', 'tips', 'yrf', 'yash raj',
  'shemaroo', 'venus', 'eros', 'speed records', 'universal music', 'times music',
  'coke studio', 'gully gang', 'mass appeal', 'rajshri', 'revibe', 'incink',
  'official',
];

/** Title fragments that mean "not a single song upload". */
export const NON_SONG_MARKERS = [
  'jukebox', 'nonstop', 'non stop', 'non-stop', 'full album', 'all songs',
  'medley', 'mashup', 'best of', 'top 10', 'top 20', 'top 50', 'collection',
  'back to back', 'superhit songs', 'hit songs', 'audio songs', 'video songs',
  'full movie', 'trailer', 'teaser', 'making of', 'behind the scenes',
  'interview', 'live show', 'promo', 'episode', 'lofi', 'lo-fi', 'slowed',
  'reverb', '8d audio', 'ringtone', 'karaoke', 'instrumental', 'cover version',
  'dance performance', 'choreography', 'tutorial', 'reaction',
  // Live recordings. Artist channels post a great many of these and they carry
  // the song title verbatim, so without this they outrank the studio version.
  'live', 'tour', 'concert', 'carnival', 'audience', 'selfies', 'garba night',
  'navratri 20', 'day 1', 'day 2', 'day 3', 'rehearsal', 'unplugged',
  'sound check', 'mahotsav', 'festival', 'event', 'show ', 'stage',
  // Album packaging. These carry the song or album name verbatim but are not
  // the track: launch events, tracklist rundowns, snippets and announcements.
  'album launch', 'tracklist', 'track list', '(album)', 'album)', 'snippet',
  'announcement', 'out now', 'coming soon', 'first look', 'sneak peek',
  'documentary', 'bts', 'vlog', 'podcast', 'cypher reveal', 'freestyle session',
  // Alternate cuts. These are the same song title but not the recording the
  // catalogue means: a Tamil dub, an acoustic strip, a synthwave rework.
  'tamil version', 'telugu version', 'kannada version', 'malayalam version',
  'marathi version', 'bengali version', 'punjabi version', 'arabic version',
  'stripped', 'acoustic', 'reprise', 'flip', 'synthwave', 'chillout',
  'recreation', 'revisited', 'remake', 'club mix', 'dj mix', 'mix)',
];

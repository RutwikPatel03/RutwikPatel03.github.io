import type { RadioTrack } from '@/types/radio';

// Indian hip-hop: gully rap, Delhi's technical school, Punjabi crossover.
//
// Tracks carrying a videoId came from the artist's own channel via
// scripts/fetch-pool.mjs + scripts/suggest-catalog.mjs, so the id and the
// spelling are the artist's own. Skits, trailers and duplicate VEVO uploads
// were curated out by hand.
//
// Tracks on `videoId: null` are real releases whose channels the pool does not
// yet cover (DIVINE's uploads feed 404s, and the MC Stan / Mass Appeal / IncInk
// handles did not resolve).
export const desiHipHopTracks: RadioTrack[] = [
  // --- KR$NA (official channel) ---
  { title: 'Boom Shaka', artist: 'KR$NA', videoId: 'cL0KKSPjZf8' },
  { title: 'Knock Knock', artist: 'KR$NA', videoId: 'Yo7q7rdRs7U' },
  { title: 'Nothing To Prove', artist: 'KR$NA', videoId: 'kB-7ZB8hqEM' },
  { title: 'Never Enough', artist: 'KR$NA', videoId: 'Y_1NX7csC_w' },
  { title: 'Buss Down', artist: 'KR$NA, Raftaar', videoId: 'jzkYSITK_H4' },
  { title: 'KKBN', artist: 'KR$NA', videoId: 'ELkfkoMiLxo' },
  { title: 'Talk My Shit / Guarantee', artist: 'KR$NA, Yashraj', videoId: 'NsF9S-n5sdI' },
  { title: 'Hello', artist: 'KR$NA, Awich', videoId: 'VTKiSD0FAvo' },
  { title: 'Vibrate', artist: 'KR$NA, Badshah', videoId: 'KE5rKBHdqRs' },
  { title: 'Who You Are', artist: 'KR$NA, Aitch', videoId: 'yNctbRL6OIw' },
  { title: 'Sensitive', artist: 'KR$NA, Seedhe Maut', videoId: '02OPySK0jsA' },
  { title: 'Yours Truly', artist: 'KR$NA', videoId: 'Prs3qcC91CY' },
  { title: 'Role Model', artist: 'KR$NA, Faris Shafi, Karma', videoId: 'ZbWSIOnZmN0' },

  // --- Seedhe Maut (official channel) ---
  { title: 'Dilli Jale Roz', artist: 'Seedhe Maut', videoId: 'iX3-YZb1-S0' },
  { title: 'SMX', artist: 'Seedhe Maut', videoId: 'tFPTglGQe-0' },
  { title: 'Pancake', artist: 'Seedhe Maut, Hurricane', videoId: 'H6H39VUGYYw' },
  { title: 'RED', artist: 'Seedhe Maut', videoId: 'XCIYHCXQoxQ' },
  { title: 'Khush Nahi', artist: 'Seedhe Maut', videoId: 'iTqPXtJ6FQs' },
  { title: 'Namuna / SRK', artist: 'Seedhe Maut', videoId: '7VXyW1FQe8E' },
  { title: 'Naksha', artist: 'Seedhe Maut', videoId: '0Ge9iUp_OlA' },
  { title: 'Soyi Nahi', artist: 'Seedhe Maut', videoId: '8YeHPj9Qcw4' },
  { title: 'Raat Ki Rani', artist: 'Seedhe Maut', videoId: 'mGwz92koI6o' },
  { title: 'Kaanch Ke Ghar', artist: 'Seedhe Maut', videoId: '-TqG6O1YfXA' },
  { title: 'TT / Shutdown', artist: 'Seedhe Maut', videoId: 'vgpH9go537Q' },
  { title: 'Bure Din', artist: 'Seedhe Maut, Mick Jenkins', videoId: 'YlGTkStN5dw' },
  { title: 'Khatta Flow', artist: 'Seedhe Maut, KR$NA', videoId: 'qVcHlaFZf6A' },
  { title: 'Taakat', artist: 'Seedhe Maut, DJ Sa, Lil Bhavi', videoId: 'FcmaxpvkSKo' },
  { title: 'Marne Ke Baad Bhi', artist: 'Seedhe Maut, Sez on the Beat', videoId: 'tj7Tupbk9X0' },

  // --- Emiway Bantai (official channel) ---
  { title: 'Bolra Hai Sadak', artist: 'Emiway Bantai', videoId: '2CXaSdz-5hI' },
  { title: 'Bus Tu', artist: 'Emiway Bantai', videoId: 'dYLKOktT2e4' },
  { title: 'Kyu?', artist: 'Emiway Bantai', videoId: '0mzrnh51EOY' },
  { title: 'Primo', artist: 'Emiway Bantai', videoId: 'XCN2WHbWC_g' },
  { title: 'Legend', artist: 'Emiway Bantai', videoId: 'ei0cg1w28HM' },
  { title: 'Jo Mein Hu', artist: 'Emiway Bantai', videoId: 'J5sW7vGr3Ek' },
  { title: 'Meri Tarah Kaun', artist: 'Emiway Bantai', videoId: '8i-Y3NhS2a8' },
  { title: 'Life', artist: 'Emiway Bantai', videoId: 'PWd1TkIxeXo' },
  { title: 'Chhabi Kar', artist: 'Emiway Bantai, MC R1', videoId: 'JMncZHRrIBY' },
  { title: 'Sadak 2.0', artist: 'Emiway Bantai, Token', videoId: 'MVLePz-MX1g' },
  { title: 'Jaane Jaa', artist: 'Emiway Bantai', videoId: '9Y4MJgEYRfk' },
  { title: 'Seedha Mai Kal Jackson', artist: 'Emiway Bantai', videoId: '_wNDguNIUZc' },
  { title: 'Lazanus', artist: 'Emiway Bantai', videoId: 'TUfQJTmROGM' },
  { title: 'Follow Karo', artist: 'Emiway Bantai', videoId: 'nmj0vAehPtI' },
  { title: '10 20', artist: 'Emiway Bantai', videoId: 'WKXEKLcftkc' },
  { title: 'Big Stepper', artist: 'Emiway Bantai', videoId: 'qaGzcxE_5B0' },
  { title: 'Bhule Nahi', artist: 'Emiway Bantai', videoId: 'p7liKu22XBU' },
  { title: 'Samandar', artist: 'Emiway Bantai', videoId: 'gP7_hPLSryE' },
  { title: 'Light Speed', artist: 'Emiway Bantai', videoId: 'eKPTFENHOig' },
  { title: 'Aflatoon', artist: 'Emiway Bantai, Naezy', videoId: 'BpWK_4hrQTs' },
  { title: 'Hawa', artist: 'Emiway Bantai', videoId: 'BA8e89tUfEw' },

  // --- Awaiting source expansion (channels unresolved or feed unavailable) ---
  { title: 'Mere Gully Mein', artist: 'DIVINE, Naezy', year: 2015, videoId: 'rm-I-EERJdY' },
  { title: 'Farak', artist: 'DIVINE', year: 2016, videoId: 'hqn0cxi2d0A' },
  { title: 'Kohinoor', artist: 'DIVINE', year: 2019, videoId: '8q_eV_RErE4' },
  { title: 'Chal Bombay', artist: 'DIVINE', year: 2019, videoId: 'hU5t7zPAELo' },
  { title: 'Satya', artist: 'DIVINE', year: 2020, videoId: 'rO4DbBjaWJY' },
  { title: '3:59 AM', artist: 'DIVINE', year: 2018, videoId: 'eHyl9KG9RWA' },
  { title: 'Punya Paap', artist: 'DIVINE', year: 2020, videoId: '4wTTAWjNlDM' },
  { title: 'Jungli Sher', artist: 'DIVINE', year: 2016, videoId: '9Wsi7YTI2nY' },
  { title: 'Basti Ka Hasti', artist: 'MC Stan', year: 2018, videoId: 'GbXtCRCT0Ig' },
  { title: 'Tadipaar', artist: 'MC Stan', year: 2020, videoId: 'AKd-3Asq60M' },
  { title: 'Astaghfirullah', artist: 'MC Stan', year: 2019, videoId: 'ROfQCNYsLL8' },
  { title: 'Insaan', artist: 'MC Stan', year: 2020, videoId: '_luvbjUrwLI' },
  { title: 'Khuja Mat', artist: 'MC Stan', year: 2019, videoId: '62bHb_RbZcs' },
  { title: 'Suno', artist: 'Prabh Deep', album: 'Class-Sikh', year: 2017, videoId: 'kWQz7HaQs6A' },
  { title: 'Class-Sikh', artist: 'Prabh Deep', year: 2017, videoId: 'zN38VR5Fr8I' },
  { title: 'Big Dawgs', artist: 'Hanumankind, Kalmi', year: 2024, videoId: 'hOHKltAiKXQ' },
  { title: 'Run It Up', artist: 'Hanumankind', year: 2025, videoId: 'MbJ72KO5khs' },
  { title: 'Mantoiyat', artist: 'Raftaar, Nawazuddin Siddiqui', year: 2018, videoId: 'mLQUP4TMdfU' },
  { title: '295', artist: 'Sidhu Moose Wala', album: 'Moosetape', year: 2021, videoId: 'n_FCrCQ6-bA' },
  { title: 'So High', artist: 'Sidhu Moose Wala, BYG BYRD', year: 2017, videoId: 'GgmFC8y8q3k' },
  { title: 'Genda Phool', artist: 'Badshah, Payal Dev', year: 2020, videoId: '8iZFTK0d8dY' },
  { title: 'DJ Waley Babu', artist: 'Badshah, Aastha Gill', year: 2015, videoId: 'AuEmR1DXyqU' },
];

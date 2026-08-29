import type { Metadata } from 'next';
import { RadioClient } from './RadioClient';
import { getStation, allStations, totalTrackCount } from '@/data/radio';

export const metadata: Metadata = {
  title: 'Radio — an always-on Indian street-corner station',
  description: `Four rotations, ${totalTrackCount} songs: cassette-era Hindi film music, garba and Gujarati folk, late-night melodies, and Indian hip-hop. Every track streams from its official YouTube upload, with a live count of everyone listening.`,
  keywords: [
    'hindi radio',
    'garba radio',
    '90s bollywood songs',
    'gujarati songs online',
    'desi hip hop radio',
    'free online radio india',
  ],
  openGraph: {
    title: 'Radio — an always-on Indian street-corner station',
    description: `Four rotations, ${totalTrackCount} songs, one continuous stream. 90s Hindi, garba, late-night melodies and Indian hip-hop.`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radio — an always-on Indian street-corner station',
    description: `Four rotations, ${totalTrackCount} songs, one continuous stream.`,
  },
};

// Presence makes this page inherently live.
export const dynamic = 'force-dynamic';

export default function RadioPage({
  searchParams,
}: {
  searchParams?: { station?: string };
}) {
  const requested = searchParams?.station;
  // getStation already falls back to the default for anything unrecognised.
  const initialStationId = getStation(requested).id;
  // A real ?station= link outranks the listener's remembered station, so a
  // shared link always opens on the station it names.
  const hasExplicitStation = allStations.some((s) => s.id === requested);

  return (
    <RadioClient initialStationId={initialStationId} hasExplicitStation={hasExplicitStation} />
  );
}

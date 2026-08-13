import { NextRequest, NextResponse } from 'next/server';
import { heartbeat, readPresence, HEARTBEAT_INTERVAL_MS } from '@/lib/presence';

// Presence is inherently live; never cache it.
export const dynamic = 'force-dynamic';

const SESSION_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

/**
 * Only real station ids may become Redis keys. An unvalidated value let any
 * string open its own presence set and inflate the global live count.
 */
const STATIONS = new Set(['saloon', 'garba', 'gully', 'melody']);
const safeStation = (value: unknown) =>
  typeof value === 'string' && STATIONS.has(value) ? value : 'saloon';

// GET - read the current live counts without joining
export async function GET(request: NextRequest) {
  const stationId = safeStation(request.nextUrl.searchParams.get('station'));
  try {
    const counts = await readPresence(stationId);
    return NextResponse.json({ ...counts, intervalMs: HEARTBEAT_INTERVAL_MS, success: true });
  } catch (error) {
    console.error('Failed to read presence:', error);
    return NextResponse.json(
      { station: 0, total: 0, success: false, error: 'Failed to read presence' },
      { status: 500 }
    );
  }
}

// POST - heartbeat: mark this session present on a station and read the counts back
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const stationId = safeStation(body.station);
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';

    if (!SESSION_ID_RE.test(sessionId)) {
      return NextResponse.json(
        { station: 0, total: 0, success: false, error: 'Invalid sessionId' },
        { status: 400 }
      );
    }

    const counts = await heartbeat(stationId, sessionId);
    return NextResponse.json({ ...counts, intervalMs: HEARTBEAT_INTERVAL_MS, success: true });
  } catch (error) {
    console.error('Failed to record heartbeat:', error);
    return NextResponse.json(
      { station: 0, total: 0, success: false, error: 'Failed to record heartbeat' },
      { status: 500 }
    );
  }
}

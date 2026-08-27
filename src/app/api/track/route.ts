import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors, checkRateLimit } from '@/lib/api';
import { recordEvents } from '@/lib/analytics';
import {
  isClientEvent,
  sanitizePath,
  sanitizeProp,
  sanitizeReferrer,
  MAX_EVENTS_PER_BATCH,
  SESSION_ID_RE,
  type AnalyticsEvent,
} from '@/lib/analytics-events';

// Event ingest. Everything arriving here is attacker-controlled: the payload
// comes from a beacon anyone can replay by hand, so each field is validated
// against the allowlists in analytics-events before it can name a Redis key.

export const dynamic = 'force-dynamic';

/** A well-behaved visitor flushes every 10s at most; 30/min leaves generous slack. */
const RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW = 60_000;

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(`track:${clientIp}`, RATE_LIMIT, RATE_LIMIT_WINDOW);
  if (!rateLimit.allowed) {
    return ApiErrors.tooManyRequests();
  }

  try {
    // sendBeacon sets its own content type, so the body is read as text and
    // parsed here rather than trusting request.json() to be handed JSON.
    const body = JSON.parse(await request.text());

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    if (!SESSION_ID_RE.test(sessionId)) {
      return ApiErrors.badRequest('Invalid sessionId');
    }

    const rawEvents = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS_PER_BATCH) : [];

    const events: AnalyticsEvent[] = [];
    for (const raw of rawEvents) {
      if (!raw || typeof raw !== 'object' || !isClientEvent(raw.event)) continue;
      const prop = sanitizeProp(raw.prop);
      const path = sanitizePath(raw.path);
      events.push({
        event: raw.event,
        ...(prop ? { prop } : {}),
        ...(path ? { path } : {}),
      });
    }

    if (events.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    await recordEvents({
      sessionId,
      referrer: sanitizeReferrer(body.referrer),
      events,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to record events:', error);
    // A dropped batch is not worth surfacing to the visitor; the page that sent
    // it has already moved on and there is nothing for it to retry.
    return new NextResponse(null, { status: 204 });
  }
}

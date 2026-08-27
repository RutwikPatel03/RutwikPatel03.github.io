import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors, checkRateLimit } from '@/lib/api';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, isValidToken, sessionValue } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/** Deliberately tight: this endpoint guards a password, so brute force is the threat. */
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60_000;

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  if (!checkRateLimit(`admin-login:${clientIp}`, RATE_LIMIT, RATE_LIMIT_WINDOW).allowed) {
    return ApiErrors.tooManyRequests('Too many attempts. Wait a minute.');
  }

  try {
    const { token } = await request.json();
    if (!isValidToken(token)) {
      return ApiErrors.unauthorized('Incorrect token');
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, sessionValue(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return ApiErrors.badRequest('Invalid request');
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// A single shared secret gates the analytics dashboard. There is no user model
// on this site and only one person ever needs in, so a password in an env var
// beats standing up auth infrastructure for an audience of one.

export const ADMIN_COOKIE = 'an_admin';

/** Thirty days: long enough not to be a chore, short enough to expire a stale laptop. */
export const ADMIN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * The cookie carries a value derived from the token rather than the token
 * itself, so a cookie that leaks into a log or a screenshot does not hand over
 * the password that minted it.
 */
export function sessionValue(token: string): string {
  return createHash('sha256').update(`${token}:analytics-admin`).digest('hex');
}

/** Constant-time compare over fixed-length digests, so neither side leaks by timing. */
function digestsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isValidToken(candidate: unknown): boolean {
  const expected = process.env.ANALYTICS_ADMIN_TOKEN;
  // No token configured means the dashboard is closed, never open. Falling open
  // here would publish every visitor's behaviour on a guessable URL.
  if (!expected || typeof candidate !== 'string' || !candidate) return false;
  return digestsMatch(
    createHash('sha256').update(candidate).digest('hex'),
    createHash('sha256').update(expected).digest('hex')
  );
}

export function isAuthenticated(): boolean {
  const expected = process.env.ANALYTICS_ADMIN_TOKEN;
  if (!expected) return false;

  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;

  return digestsMatch(cookie, sessionValue(expected));
}

/** Distinguishes "wrong password" from "nobody set a password yet" in the UI. */
export const isConfigured = (): boolean => Boolean(process.env.ANALYTICS_ADMIN_TOKEN);

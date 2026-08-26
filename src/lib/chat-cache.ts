import { createHash } from 'crypto';
import { redis } from './redis';
import { CONTEXT_FREE_QUESTIONS, normalizeQuestion } from './chat-prompts';

// Groq's free tier reserves `prompt + max_tokens` against an 8K tokens/minute
// budget, and that budget is per organization rather than per visitor. With a
// ~1.2K system prompt on every turn, a handful of simultaneous visitors is
// enough to exhaust it site-wide.
//
// A portfolio assistant is asked the same two dozen questions forever, so the
// cheapest token is the one never spent: identical questions are answered from
// Redis and never reach Groq at all.

/** Answers stay fresh for a week; the underlying facts change far more slowly. */
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Long free-typed questions are unlikely to repeat, so they are not worth a key. */
const MAX_CACHEABLE_LENGTH = 200;

/**
 * A cached answer is only valid for the prompt that produced it. Folding the
 * model and system prompt into the key means editing the resume silently
 * invalidates every stale answer instead of serving outdated facts for a week.
 */
export function promptFingerprint(model: string, systemPrompt: string): string {
  return createHash('sha256').update(`${model} ${systemPrompt}`).digest('hex').slice(0, 12);
}

/**
 * Cacheable when the question stands on its own: either it opens the
 * conversation, or it is one of the canned prompts the UI itself generates.
 * Anything else may lean on earlier turns, where a shared answer would be wrong.
 */
export function isCacheable(message: string, historyLength: number): boolean {
  const normalized = normalizeQuestion(message);
  if (!normalized || message.length > MAX_CACHEABLE_LENGTH) return false;
  return historyLength === 0 || CONTEXT_FREE_QUESTIONS.has(normalized);
}

export function cacheKey(fingerprint: string, message: string): string {
  const digest = createHash('sha256')
    .update(`${fingerprint} ${normalizeQuestion(message)}`)
    .digest('hex')
    .slice(0, 24);
  return `chat:answer:${digest}`;
}

/** Redis being unavailable must never take the chat down; we just pay for a call. */
export async function readCachedReply(key: string): Promise<string | null> {
  try {
    return await redis.get<string>(key);
  } catch (error) {
    console.error('Chat cache read failed, falling through to Groq:', error);
    return null;
  }
}

export async function writeCachedReply(key: string, reply: string): Promise<void> {
  try {
    await redis.set(key, reply, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('Chat cache write failed:', error);
  }
}

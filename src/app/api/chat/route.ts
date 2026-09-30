import { NextRequest } from 'next/server';
import { ApiErrors, validateString, checkRateLimit } from '@/lib/api';
import {
  cacheKey,
  isCacheable,
  promptFingerprint,
  readCachedReply,
  writeCachedReply,
} from '@/lib/chat-cache';
import { recordQuestion } from '@/lib/analytics';
import { SYSTEM_PROMPT } from '@/lib/chat/knowledge';
import { BUSY_MESSAGE, DROPPED_MESSAGE, openTurn, type WireMessage } from '@/lib/chat/agent';
import { configuredProviders } from '@/lib/chat/providers';
import type { ChatEvent } from '@/lib/chat/protocol';

// Streams the chat agent's answer as newline-delimited JSON (see
// lib/chat/protocol.ts), after rate limiting, the answer cache and analytics.

export const maxDuration = 30;

// ===========================================
// Configuration
// ===========================================

// Each retained turn is re-sent on every request. Four keeps a follow-up
// coherent without letting a long conversation inflate the prompt indefinitely.
const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_CHARS = 1500;

const RATE_LIMIT = 10; // requests per window, per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

const EMPTY_MESSAGE = "Sorry, I couldn't come up with an answer to that. Try asking another way?";

const PROVIDERS = configuredProviders();

/** Changes whenever a model or the facts change, expiring stale answers. */
const PROMPT_FINGERPRINT = promptFingerprint(
  PROVIDERS.map((p) => p.model).join(','),
  SYSTEM_PROMPT
);

// ===========================================
// Request handling
// ===========================================

/** Only plain user/assistant turns get through; a client cannot inject a system message. */
function sanitizeHistory(raw: unknown): WireMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim()
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }));
}

function streamResponse(run: (emit: (event: ChatEvent) => void) => Promise<void>, abort: AbortController) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ChatEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The visitor has gone; the abort below stops the work.
        }
      };
      try {
        await run(emit);
      } catch (error) {
        if (!abort.signal.aborted) {
          console.error('Chat stream error:', error);
          emit({ type: 'error', message: DROPPED_MESSAGE });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by a cancel.
        }
      }
    },
    // Pressing stop cancels the stream, which stops spending tokens on it too.
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(clientIp, RATE_LIMIT, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      return ApiErrors.tooManyRequests(
        "You're sending messages a bit quickly. Give it a moment and try again."
      );
    }

    const body = await request.json();
    const { message } = body;
    const messageError = validateString(message, 'message', { minLength: 1, maxLength: 2000 });
    if (messageError) {
      return ApiErrors.badRequest(messageError);
    }
    const history = sanitizeHistory(body.history);

    const abort = new AbortController();
    request.signal.addEventListener('abort', () => abort.abort());

    // Serve repeat questions from Redis so they never touch the token budget
    const cacheable = isCacheable(message, history.length);
    const key = cacheKey(PROMPT_FINGERPRINT, message);

    if (cacheable) {
      const cached = await readCachedReply(key);
      if (cached) {
        // Recorded before returning rather than fired and forgotten: a
        // serverless invocation can be frozen the moment it responds, which
        // would drop the write on exactly the fastest path.
        await recordQuestion(message, true);
        return streamResponse(async (emit) => {
          for (const part of cached.parts) {
            if (part.kind === 'text') emit({ type: 'text', delta: part.text });
            else emit({ type: 'tool', ...part });
          }
          emit({ type: 'done', cached: true });
        }, abort);
      }
    }

    // Every question that reaches the model is worth recording even if the call
    // below fails — a question asked is a question asked.
    await recordQuestion(message, false);

    if (PROVIDERS.length === 0) {
      console.error('Neither GEMINI_API_KEY nor GROQ_API_KEY is configured');
      return ApiErrors.serviceUnavailable('AI service not configured');
    }

    const messages: WireMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];

    // The first call is made before the stream opens, so a spent budget still
    // comes back as a plain 429 the UI can explain.
    const turn = await openTurn(PROVIDERS, messages, abort.signal);
    if (!turn.ok) {
      return turn.status === 429
        ? ApiErrors.tooManyRequests(BUSY_MESSAGE)
        : ApiErrors.serviceUnavailable('AI service temporarily unavailable');
    }

    return streamResponse(async (emit) => {
      const { parts, usedLiveData, failed } = await turn.run(emit);
      if (failed) return;

      const answered = parts.some((p) => p.kind === 'text' && p.text.trim());
      if (!answered) {
        emit({ type: 'text', delta: EMPTY_MESSAGE });
      } else if (cacheable && !usedLiveData) {
        await writeCachedReply(key, { parts });
      }
      emit({ type: 'done' });
    }, abort);
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof SyntaxError) {
      return ApiErrors.badRequest('Invalid JSON in request body');
    }

    return ApiErrors.internalError('An unexpected error occurred');
  }
}

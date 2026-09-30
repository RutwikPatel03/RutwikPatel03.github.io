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
import { TOOL_DEFINITIONS, TOOL_NAMES, runTool, toolLabel } from '@/lib/chat/tools';
import { configuredProviders, type Provider } from '@/lib/chat/providers';
import type { ChatEvent, MessagePart, ToolName } from '@/lib/chat/protocol';

// A small agent: the model streams its answer, may call a tool, sees the
// result and carries on. The response is newline-delimited JSON (see
// lib/chat/protocol.ts) so the UI can render text and tool calls as they land.

export const maxDuration = 30;

// ===========================================
// Configuration
// ===========================================

// Each retained turn is re-sent on every request. Four keeps a follow-up
// coherent without letting a long conversation inflate the prompt indefinitely.
const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_CHARS = 1500;

// Up to two rounds of tool calls, then a final round where tools are off, so a
// model that keeps calling tools still has to answer.
const MAX_ROUNDS = 3;

const RATE_LIMIT = 10; // requests per window, per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

const BUSY_MESSAGE = "I'm getting a lot of questions right now. Try again in a few seconds.";
const DROPPED_MESSAGE = 'Sorry, I lost the connection partway through. Please try again.';
const EMPTY_MESSAGE = "Sorry, I couldn't come up with an answer to that. Try asking another way?";

const PROVIDERS = configuredProviders();

/** Changes whenever a model or the facts change, expiring stale answers. */
const PROMPT_FINGERPRINT = promptFingerprint(
  PROVIDERS.map((p) => p.model).join(','),
  SYSTEM_PROMPT
);

// ===========================================
// Model calls
// ===========================================

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
  /** Gemini's thought signature, which must be echoed back with the call. */
  extra_content?: unknown;
}

type WireMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

/** Gemini-only fields are dropped when a turn falls back to Groq mid-way. */
function forProvider(messages: WireMessage[], provider: Provider): WireMessage[] {
  if (provider.name === 'gemini') return messages;
  return messages.map((m) =>
    m.role === 'assistant' && m.tool_calls
      ? { ...m, tool_calls: m.tool_calls.map(({ id, type, function: fn }) => ({ id, type, function: fn })) }
      : m
  );
}

/**
 * Tries each provider from `start` until one accepts the request. Any refusal
 * falls through: a spent quota, an outage, or a model id Google has retired
 * should all cost a visitor nothing when the next provider can answer.
 */
async function callModel(
  messages: WireMessage[],
  allowTools: boolean,
  signal: AbortSignal,
  start = 0
): Promise<{ response: Response; index: number } | { response: null; status: number }> {
  let status = 503;
  for (let index = start; index < PROVIDERS.length; index++) {
    const provider = PROVIDERS[index];
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${provider.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: provider.model,
          messages: forProvider(messages, provider),
          stream: true,
          tools: TOOL_DEFINITIONS,
          tool_choice: allowTools ? 'auto' : 'none',
          ...provider.params,
        }),
        signal,
      });
      if (response.ok) return { response, index };
      status = response.status;
      console.error(`${provider.name} API error:`, status, await response.text());
    } catch (error) {
      if (signal.aborted) throw error;
      console.error(`${provider.name} request failed:`, error);
    }
  }
  return { response: null, status };
}

/** Yields each parsed `data:` chunk of an OpenAI-style server-sent event stream. */
async function* readSse(response: Response) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      yield JSON.parse(data);
    }
  }
}

/** Streams one model round's text out as it arrives and collects its tool calls. */
async function streamRound(response: Response, onText: (delta: string) => void) {
  let text = '';
  const calls: ToolCall[] = [];
  for await (const chunk of readSse(response)) {
    if (chunk.error) throw new Error(chunk.error.message ?? 'Model stream error');
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) continue;
    if (delta.content) {
      text += delta.content;
      onText(delta.content);
    }
    for (const call of delta.tool_calls ?? []) {
      // Gemini sends each call whole and without an index; Groq may split one
      // across chunks and relies on the index to stitch it back together.
      const slot = (calls[call.index ?? calls.length] ??= {
        id: '',
        type: 'function',
        function: { name: '', arguments: '' },
      });
      if (call.id) slot.id = call.id;
      if (call.extra_content) slot.extra_content = call.extra_content;
      if (call.function?.name) slot.function.name += call.function.name;
      if (call.function?.arguments) slot.function.arguments += call.function.arguments;
    }
  }
  return {
    text,
    toolCalls: calls.filter(Boolean).map((c, i) => ({ ...c, id: c.id || `call_${i}` })),
  };
}

function parseArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

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

/** Appends streamed text to the turn, merging into the text part it continues. */
function appendText(parts: MessagePart[], delta: string) {
  const last = parts[parts.length - 1];
  if (last?.kind === 'text') last.text += delta;
  else parts.push({ kind: 'text', text: delta });
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
    const first = await callModel(messages, true, abort.signal);
    if (!first.response) {
      return first.status === 429
        ? ApiErrors.tooManyRequests(BUSY_MESSAGE)
        : ApiErrors.serviceUnavailable('AI service temporarily unavailable');
    }

    return streamResponse(async (emit) => {
      const parts: MessagePart[] = [];
      // Live data goes stale within the hour, so answers built on it are not cached.
      let usedLiveData = false;
      let { response, index: provider } = first;

      for (let round = 0; ; round++) {
        const { text, toolCalls } = await streamRound(response, (delta) => {
          appendText(parts, delta);
          emit({ type: 'text', delta });
        });

        const calls = toolCalls.filter((c) => TOOL_NAMES.has(c.function.name));
        if (calls.length === 0 || round >= MAX_ROUNDS - 1) break;

        messages.push({ role: 'assistant', content: text || null, tool_calls: calls });
        for (const call of calls) {
          const name = call.function.name as ToolName;
          const args = parseArgs(call.function.arguments);
          const part: MessagePart = {
            kind: 'tool',
            id: call.id,
            name,
            label: toolLabel(name, args),
            status: 'running',
          };
          parts.push(part);
          emit({ type: 'tool', ...part });

          const result = await runTool(name, args);
          if (result.github) {
            usedLiveData = true;
            emit({ type: 'github', activity: result.github });
          }
          part.status = result.ok ? 'done' : 'error';
          part.summary = result.summary;
          emit({ type: 'tool', ...part });
          messages.push({ role: 'tool', tool_call_id: call.id, content: result.content });
        }

        // The same provider carries on the turn, falling back only if it now refuses.
        const allowTools = round + 1 < MAX_ROUNDS - 1;
        const next = await callModel(messages, allowTools, abort.signal, provider);
        if (!next.response) {
          emit({ type: 'error', message: next.status === 429 ? BUSY_MESSAGE : DROPPED_MESSAGE });
          return;
        }
        ({ response, index: provider } = next);
      }

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

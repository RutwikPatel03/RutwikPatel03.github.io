import { TOOL_DEFINITIONS, TOOL_NAMES, runTool, toolLabel, toolSubject } from './tools';
import type { Provider } from './providers';
import type { ChatEvent, MessagePart, ToolName } from './protocol';

// A small agent: the model streams its answer, may call a tool, sees the
// result and carries on. It knows nothing about HTTP, caching or analytics,
// so the API route and the answer-quality eval (scripts/chat-eval.ts) run the
// exact same loop.

// Up to two rounds of tool calls, then a final round where tools are off, so a
// model that keeps calling tools still has to answer.
const MAX_ROUNDS = 3;

export const BUSY_MESSAGE = "I'm getting a lot of questions right now. Try again in a few seconds.";
export const DROPPED_MESSAGE = 'Sorry, I lost the connection partway through. Please try again.';

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

export type WireMessage =
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
  providers: Provider[],
  messages: WireMessage[],
  allowTools: boolean,
  signal: AbortSignal,
  start = 0
): Promise<{ response: Response; index: number } | { response: null; status: number }> {
  let status = 503;
  for (let index = start; index < providers.length; index++) {
    const provider = providers[index];
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

/** Appends streamed text to the turn, merging into the text part it continues. */
function appendText(parts: MessagePart[], delta: string) {
  const last = parts[parts.length - 1];
  if (last?.kind === 'text') last.text += delta;
  else parts.push({ kind: 'text', text: delta });
}

export interface TurnResult {
  parts: MessagePart[];
  /** True when a tool fetched live data, which goes stale within the hour. */
  usedLiveData: boolean;
  /** True when the turn broke off with an error event. */
  failed: boolean;
}

export type OpenedTurn =
  | { ok: true; run: (emit: (event: ChatEvent) => void) => Promise<TurnResult> }
  | { ok: false; status: number };

/**
 * Makes the first model call up front, so a caller can still answer a refusal
 * with a plain status code, then hands back `run` to stream the rest.
 */
export async function openTurn(
  providers: Provider[],
  messages: WireMessage[],
  signal: AbortSignal
): Promise<OpenedTurn> {
  const first = await callModel(providers, messages, true, signal);
  if (!first.response) return { ok: false, status: first.status };

  const run = async (emit: (event: ChatEvent) => void): Promise<TurnResult> => {
    const parts: MessagePart[] = [];
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
          subject: toolSubject(name, args),
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
      const next = await callModel(providers, messages, allowTools, signal, provider);
      if (!next.response) {
        emit({ type: 'error', message: next.status === 429 ? BUSY_MESSAGE : DROPPED_MESSAGE });
        return { parts, usedLiveData, failed: true };
      }
      ({ response, index: provider } = next);
    }

    return { parts, usedLiveData, failed: false };
  };

  return { ok: true, run };
}

import type { ChatEvent } from './protocol';

/** A non-2xx answer from /api/chat, carrying the server's explanation if it sent one. */
export class ChatHttpError extends Error {
  constructor(
    public status: number,
    public reason?: string
  ) {
    super(reason ?? `Chat request failed with ${status}`);
  }
}

interface StreamChatOptions {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  signal: AbortSignal;
  onEvent: (event: ChatEvent) => void;
}

/** Posts a question and calls `onEvent` for each line of the NDJSON reply as it arrives. */
export async function streamChat({ message, history, signal, onEvent }: StreamChatOptions) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null);
    throw new ChatHttpError(response.status, typeof body?.error === 'string' ? body.error : undefined);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as ChatEvent);
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as ChatEvent);
}

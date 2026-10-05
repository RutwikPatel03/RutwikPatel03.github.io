'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import { CornerDownLeft, Copy, Check, Square } from 'lucide-react';
import {
  EXTRA_COMMANDS,
  FOLLOW_UP_QUESTIONS,
  INITIAL_SUGGESTION_TOPICS,
  TOPIC_COMMANDS,
  buildTopicQuestion,
  cardSubjectName,
  followUpsForCards,
  normalizeQuestion,
  resolveTopicCommand,
} from '@/lib/chat-prompts';
import { ChatHttpError, streamChat } from '@/lib/chat/client';
import { CARD_TAG, type ChatEvent, type GitHubActivity, type MessagePart } from '@/lib/chat/protocol';
import type { PostMeta } from '@/lib/blog';
import { track } from '@/lib/analytics-client';
import { ACCENT, AssistantMessage, plainText, useSpinner } from './AssistantMessage';

// Matches MAX_HISTORY_MESSAGES on the server; sending more just wastes payload.
const HISTORY_LIMIT = 4;

const CONNECTION_ERROR = "Sorry, I'm having trouble connecting. Please try again.";

type UserTurn = { id: number; role: 'user'; content: string };
type AssistantTurn = {
  id: number;
  role: 'assistant';
  parts: MessagePart[];
  github?: GitHubActivity;
  status: 'streaming' | 'done' | 'interrupted' | 'error';
  /** Shown under the answer when the stream broke off partway. */
  notice?: string;
};
type Turn = UserTurn | AssistantTurn;

interface Command {
  command: string;
  label: string;
  question?: string;
}

// Everything the command menu and the empty state offer. /clear is handled here
// and never reaches the server.
const COMMANDS: Command[] = [
  ...INITIAL_SUGGESTION_TOPICS.map((topic, i) => ({
    command: TOPIC_COMMANDS[i],
    label: topic,
    question: buildTopicQuestion(topic),
  })),
  ...EXTRA_COMMANDS,
  { command: '/clear', label: 'Start a fresh conversation' },
];

/** Applies one streamed event to the answer being written. */
function applyEvent(turn: AssistantTurn, event: ChatEvent): AssistantTurn {
  switch (event.type) {
    case 'text': {
      const last = turn.parts[turn.parts.length - 1];
      const parts =
        last?.kind === 'text'
          ? [...turn.parts.slice(0, -1), { ...last, text: last.text + event.delta }]
          : [...turn.parts, { kind: 'text' as const, text: event.delta }];
      return { ...turn, parts };
    }
    case 'tool': {
      const { id, name, label, status, summary, subject } = event;
      const part: MessagePart = { kind: 'tool', id, name, label, status, summary, subject };
      const index = turn.parts.findIndex((p) => p.kind === 'tool' && p.id === id);
      const parts =
        index === -1 ? [...turn.parts, part] : turn.parts.map((p, i) => (i === index ? part : p));
      return { ...turn, parts };
    }
    case 'github':
      return { ...turn, github: event.activity };
    case 'error':
      return { ...turn, status: 'error', notice: event.message };
    case 'done':
      return turn;
  }
}

/** What the spinner line says, from what the answer is doing right now. */
function activity(turn: Turn | undefined): string {
  if (!turn || turn.role !== 'assistant') return 'Thinking';
  const last = turn.parts[turn.parts.length - 1];
  if (!last) return 'Thinking';
  if (last.kind === 'tool') return last.status === 'running' ? `Running ${last.label}` : 'Reading the results';
  return 'Writing';
}

export default function ChatInterface({ posts }: { posts: PostMeta[] }) {
  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScroll = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const spinner = useSpinner(isLoading);

  // Typing "/" opens the command menu, filtered by what follows.
  const menu =
    input.startsWith('/') && !/\s/.test(input)
      ? COMMANDS.filter((c) => c.command.startsWith(input.toLowerCase()))
      : [];

  useEffect(() => setMenuIndex(0), [input]);

  // Check if user has scrolled up
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  // Follows the answer as it streams in, unless the reader has scrolled up.
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el && shouldAutoScroll.current) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Auto-resize textarea - use requestAnimationFrame to avoid forced reflow
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    });
  }, [input]);

  const last = messages[messages.length - 1];
  const lastAnswered = !isLoading && last?.role === 'assistant' && last.status === 'done';

  // Follow-ups about what the answer just showed come first; general ones fill
  // the rest. Nothing is picked while an answer is still streaming.
  useEffect(() => {
    if (!lastAnswered || last?.role !== 'assistant') return;
    const text = last.parts.map((p) => (p.kind === 'text' ? p.text : '')).join('\n');
    const cards = Array.from(text.matchAll(CARD_TAG), (m) => (m[2] ? `${m[1]}:${m[2]}` : m[1]));
    // A card the answer already went deep on needs no "tell me more".
    const covered = new Set(last.parts.map((p) => (p.kind === 'tool' ? p.subject : undefined)));
    const asked = new Set(Array.from(usedSuggestions, normalizeQuestion));
    const fresh = (q: string) => !asked.has(normalizeQuestion(q));
    const specific = Array.from(new Set(followUpsForCards(cards.filter((c) => !covered.has(c)))))
      .filter(fresh)
      .slice(0, 2);
    // A general question about something the answer just covered would repeat it.
    const shown = cards.map(cardSubjectName).filter((n): n is string => !!n);
    const general = FOLLOW_UP_QUESTIONS.filter(
      (q) => fresh(q) && !shown.some((name) => q.toLowerCase().includes(name))
    );
    const shuffled = [...general].sort(() => Math.random() - 0.5);
    setCurrentSuggestions([...specific, ...shuffled].slice(0, 3));
  }, [lastAnswered, last, usedSuggestions]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  // Esc interrupts an answer, as in a terminal session.
  useEffect(() => {
    if (!isLoading) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLoading, stop]);

  const updateReply = (id: number, fn: (turn: AssistantTurn) => AssistantTurn) =>
    setMessages((prev) => prev.map((m) => (m.id === id && m.role === 'assistant' ? fn(m) : m)));

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendMessage = async (raw: string) => {
    const typed = raw.trim();
    if (!typed || isLoading) return;
    setInput('');

    if (typed.toLowerCase() === '/clear') {
      setMessages([]);
      setUsedSuggestions(new Set());
      return;
    }

    const message = resolveTopicCommand(typed);
    setUsedSuggestions((prev) => new Set(Array.from(prev).concat(message)));

    // Only finished answers are context; a failed or interrupted one would
    // teach the model to repeat the failure.
    const history = messages
      .filter((m) => m.role === 'user' || m.status === 'done')
      .map((m) =>
        m.role === 'user'
          ? { role: 'user' as const, content: m.content }
          : { role: 'assistant' as const, content: plainText(m.parts) }
      )
      .filter((m) => m.content)
      .slice(-HISTORY_LIMIT);

    const userId = nextId.current++;
    const replyId = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: message },
      { id: replyId, role: 'assistant', parts: [], status: 'streaming' },
    ]);
    shouldAutoScroll.current = true;
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat({
        message,
        history,
        signal: controller.signal,
        onEvent: (event) => updateReply(replyId, (turn) => applyEvent(turn, event)),
      });
      updateReply(replyId, (turn) => (turn.status === 'streaming' ? { ...turn, status: 'done' } : turn));
    } catch (error) {
      if (controller.signal.aborted) {
        updateReply(replyId, (turn) => ({ ...turn, status: 'interrupted' }));
      } else {
        // A 429 carries a specific, user-facing explanation worth showing;
        // anything else falls back to the generic connection message.
        const reason =
          error instanceof ChatHttpError && error.status === 429 && error.reason
            ? error.reason
            : CONNECTION_ERROR;
        updateReply(replyId, (turn) =>
          turn.parts.length
            ? { ...turn, status: 'error', notice: reason }
            : { ...turn, status: 'error', parts: [{ kind: 'text', text: reason }] }
        );
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  // The homepage hero hands off a question as /ai?q=... Read it straight from
  // window.location (useSearchParams would force a Suspense boundary on this
  // page), drop it from the URL so a refresh doesn't ask again, then send it.
  // The ref keeps React Strict Mode's double-run from sending it twice.
  const askedFromUrl = useRef(false);
  useEffect(() => {
    if (askedFromUrl.current) return;
    askedFromUrl.current = true;
    const question = new URLSearchParams(window.location.search).get('q')?.trim();
    if (!question) return;
    window.history.replaceState(null, '', window.location.pathname);
    sendMessage(question.slice(0, 2000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCommand = (command: Command) => {
    track('chat_topic', command.command);
    sendMessage(command.question ?? command.command);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (menu.length) runCommand(menu[menuIndex]);
    else sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (menu.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setMenuIndex((i) => (i + step + menu.length) % menu.length);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setInput(menu[menuIndex].command);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden font-mono">
      {/* Messages Area - Full width scroll container with scrollbar at page edge */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-scroll">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 text-sm sm:text-[15px] leading-relaxed">
          {/* Welcome box, shown at the top of every session like a terminal banner */}
          <div className="rounded-lg border border-[#D97757]/70 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-foreground">
              <span className={ACCENT} aria-hidden="true">✻ </span>
              Welcome to <span className="font-semibold">Rutwik&apos;s AI</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Ask about his experience, projects, and what he&apos;s building right now.
            </p>
            <p className="text-muted-foreground">
              It can play project videos, read his blog, and check his GitHub live.
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-muted-foreground">Commands</p>
              <ul>
                {COMMANDS.filter((c) => c.question).map((c) => (
                  <li key={c.command}>
                    <button
                      onClick={() => runCommand(c)}
                      className="group -mx-2 flex w-full items-baseline gap-4 rounded px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="w-28 shrink-0 text-foreground transition-colors group-hover:text-[#D97757]">
                        {c.command}
                      </span>
                      <span className="text-muted-foreground">{c.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 space-y-5 sm:space-y-6">
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <div key={msg.id} className="flex gap-2 rounded bg-accent px-3 py-2 text-foreground">
                    <span className="select-none text-muted-foreground" aria-hidden="true">&gt;</span>
                    <p className="min-w-0 whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                ) : (
                  <div key={msg.id} className="group relative pr-8">
                    <AssistantMessage parts={msg.parts} github={msg.github} posts={posts} />
                    {msg.status === 'interrupted' && (
                      <p className="mt-1 text-muted-foreground">
                        <span className="select-none" aria-hidden="true">⎿{'  '}</span>
                        Interrupted
                      </p>
                    )}
                    {msg.notice && (
                      <p className="mt-1 text-red-500">
                        <span className="select-none" aria-hidden="true">⎿{'  '}</span>
                        {msg.notice}
                      </p>
                    )}
                    {msg.status === 'done' && plainText(msg.parts) && (
                      <button
                        onClick={() => copyToClipboard(plainText(msg.parts), msg.id)}
                        className="absolute right-0 top-0 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                        title="Copy to clipboard"
                        aria-label="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )
              )}
              {/* Working indicator */}
              {isLoading && (
                <div className={`flex gap-2 ${ACCENT}`} role="status">
                  <span className="w-[1ch] select-none" aria-hidden="true">{spinner}</span>
                  <span className="min-w-0 truncate">{activity(last)}…</span>
                  <span className="hidden shrink-0 text-muted-foreground sm:inline">(esc to interrupt)</span>
                </div>
              )}
              {/* Follow-up suggestions */}
              {lastAnswered && currentSuggestions.length > 0 && (
                <div className="flex gap-2 pl-1 text-muted-foreground">
                  <span className="select-none" aria-hidden="true">└</span>
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="text-xs">try asking</span>
                    {currentSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          track('chat_topic', 'follow_up');
                          sendMessage(suggestion);
                        }}
                        className="text-left transition-colors hover:text-[#D97757]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 relative z-10 bg-background px-2 pb-2 pt-2 sm:px-4 sm:pb-4">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          {/* Command menu, opened by typing "/" */}
          {menu.length > 0 && (
            <ul
              role="listbox"
              aria-label="Commands"
              className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-lg border border-border bg-background py-1 text-sm shadow-lg"
            >
              {menu.map((c, i) => (
                <li key={c.command} role="option" aria-selected={i === menuIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setMenuIndex(i)}
                    onClick={() => runCommand(c)}
                    className={`flex w-full items-baseline gap-4 px-3 py-1.5 text-left ${
                      i === menuIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <span className={`w-24 shrink-0 ${i === menuIndex ? ACCENT : 'text-foreground'}`}>
                      {c.command}
                    </span>
                    <span className="truncate text-muted-foreground">{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2 rounded-lg border border-border bg-background pl-3 pr-1.5 py-1 transition-colors focus-within:border-[var(--ring)]">
            <span className="select-none py-2 text-sm sm:text-[15px] text-muted-foreground" aria-hidden="true">&gt;</span>
            <label htmlFor="chat-input" className="sr-only">Ask about Rutwik</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              placeholder="Ask anything, or type /"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-1 bg-transparent resize-none py-2 font-mono text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[150px] sm:max-h-[200px] leading-relaxed"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded text-[#D97757] transition-colors hover:bg-accent"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-[#D97757] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-1.5 flex justify-between gap-4 px-1 text-[11px] sm:text-xs text-muted-foreground">
            <span className="hidden sm:inline">enter to send · / for commands · esc to interrupt</span>
            <span className="ml-auto">powered by Gemini · Groq</span>
          </div>
        </form>
      </div>
    </div>
  );
}

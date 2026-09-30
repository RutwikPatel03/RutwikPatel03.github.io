'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { CornerDownLeft, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '@/types';
import {
  FOLLOW_UP_QUESTIONS,
  INITIAL_SUGGESTION_TOPICS,
  TOPIC_COMMANDS,
  buildTopicQuestion,
  resolveTopicCommand,
} from '@/lib/chat-prompts';
import { track } from '@/lib/analytics-client';

const ALL_FOLLOW_UPS = FOLLOW_UP_QUESTIONS;

// The page is styled like a terminal session; this is its one accent color.
const ACCENT = 'text-[#D97757]';

// Cycled while waiting for an answer, like a terminal spinner.
const SPINNER_FRAMES = ['·', '✢', '✳', '✶', '✻', '✽'];

// Matches MAX_HISTORY_MESSAGES on the server; sending more just wastes payload.
const HISTORY_LIMIT = 4;

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScroll = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Check if user has scrolled up
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // If user is near the bottom (within 100px), enable auto-scroll
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea - use requestAnimationFrame to avoid forced reflow
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    // Batch DOM reads and writes to avoid layout thrashing
    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    });
  }, [input]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isLoading) {
      const available = ALL_FOLLOW_UPS.filter(s => !usedSuggestions.has(s));
      const shuffled = available.sort(() => Math.random() - 0.5);
      setCurrentSuggestions(shuffled.slice(0, 3));
    }
  }, [messages, usedSuggestions, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length), 120);
    return () => clearInterval(id);
  }, [isLoading]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    setUsedSuggestions(prev => new Set(Array.from(prev).concat(message)));
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: messages.slice(-HISTORY_LIMIT) }),
      });

      if (!response.ok) {
        // A 429 carries a specific, user-facing explanation worth showing;
        // anything else falls back to the generic connection message.
        const body = await response.json().catch(() => null);
        const reason =
          response.status === 429 && typeof body?.error === 'string'
            ? body.error
            : "Sorry, I'm having trouble connecting. Please try again.";
        setMessages((prev) => [...prev, { role: 'assistant', content: reason }]);
        return;
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
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
    sendMessage(resolveTopicCommand(question.slice(0, 2000)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typing a topic command like "/projects" asks its canned question.
  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(resolveTopicCommand(input)); };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(resolveTopicCommand(input)); }
  };

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden font-mono">
      {/* Messages Area - Full width scroll container with scrollbar at page edge */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 text-sm sm:text-[15px] leading-relaxed">
          {/* Welcome box, shown at the top of every session like a terminal banner */}
          <div className="rounded-lg border border-[#D97757]/70 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-foreground">
              <span className={ACCENT} aria-hidden="true">✻ </span>
              Welcome to <span className="font-semibold">Rutwik&apos;s AI</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Ask about his experience, skills, projects, and education.
            </p>
            <p className="text-muted-foreground">Type a question, or pick a command below.</p>
          </div>

          {messages.length === 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-muted-foreground">Commands</p>
              <ul>
                {INITIAL_SUGGESTION_TOPICS.map((topic, i) => (
                  <li key={topic}>
                    <button
                      onClick={() => {
                        track('chat_topic', topic);
                        sendMessage(buildTopicQuestion(topic));
                      }}
                      className="group -mx-2 flex w-full items-baseline gap-4 rounded px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="w-28 shrink-0 text-foreground transition-colors group-hover:text-[#D97757]">
                        {TOPIC_COMMANDS[i]}
                      </span>
                      <span className="text-muted-foreground">{topic}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 space-y-5 sm:space-y-6">
              {messages.map((msg, index) =>
                msg.role === 'user' ? (
                  <div key={index} className="flex gap-2 rounded bg-accent px-3 py-2 text-foreground">
                    <span className="select-none text-muted-foreground" aria-hidden="true">&gt;</span>
                    <p className="min-w-0 whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                ) : (
                  <div key={index} className="group relative flex gap-2">
                    <span className={`select-none ${ACCENT}`} aria-hidden="true">●</span>
                    <div className="min-w-0 flex-1 pr-8 text-foreground
                      [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&>*:last-child]:mb-0
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_li]:[list-style:inherit]
                      [&_h1]:mb-2 [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold
                      [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-accent [&_code]:px-1
                      [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#D97757]">
                      <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                    </div>
                    {msg.content && (
                      <button
                        onClick={() => copyToClipboard(msg.content, index)}
                        className="absolute right-0 top-0 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                        title="Copy to clipboard"
                        aria-label="Copy answer"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )
              )}
              {/* Loading indicator */}
              {isLoading && (
                <div className={`flex gap-2 ${ACCENT}`} role="status">
                  <span className="w-[1ch] select-none" aria-hidden="true">{SPINNER_FRAMES[spinnerFrame]}</span>
                  <span>Thinking…</span>
                </div>
              )}
              {/* Follow-up suggestions */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content && currentSuggestions.length > 0 && (
                <div className="flex gap-2 pl-1 text-muted-foreground">
                  <span className="select-none" aria-hidden="true">└</span>
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="text-xs">try asking</span>
                    {currentSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 relative z-10 bg-background px-2 pb-2 pt-2 sm:px-4 sm:pb-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-background pl-3 pr-1.5 py-1 transition-colors focus-within:border-[var(--ring)]">
            <span className="select-none py-2 text-sm sm:text-[15px] text-muted-foreground" aria-hidden="true">&gt;</span>
            <label htmlFor="chat-input" className="sr-only">Ask about Rutwik</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              placeholder='Try "Tell me about Sigma"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent resize-none py-2 font-mono text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[150px] sm:max-h-[200px] leading-relaxed"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-[#D97757] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1.5 flex justify-between gap-4 px-1 text-[11px] sm:text-xs text-muted-foreground">
            <span className="hidden sm:inline">enter to send · shift+enter for new line</span>
            <span className="ml-auto">powered by Groq</span>
          </div>
        </form>
      </div>
    </div>
  );
}

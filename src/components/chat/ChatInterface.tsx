'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, User, Bot, Briefcase, Code, FolderOpen, GraduationCap, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '@/types';

const INITIAL_SUGGESTIONS = [
  { text: 'Work experience', icon: Briefcase },
  { text: 'Technical skills', icon: Code },
  { text: 'Projects', icon: FolderOpen },
  { text: 'Education', icon: GraduationCap },
];

const ALL_FOLLOW_UPS = [
  'What did he do at Sigma Computing?',
  'Tell me about his work at World Salon',
  'What are his key achievements?',
  'What frontend frameworks does he know?',
  'Tell me about his backend experience',
  'Has he worked with cloud services?',
  'Tell me about the RAG system he built',
  'What was his cataract detection project?',
  'Has he built any full-stack applications?',
  'Where did he study?',
  'What courses has he taken?',
  'Tell me about his research publications',
  'What programming languages does he know?',
  'How can I contact him?',
  'What AI/ML projects has he worked on?',
  'Tell me about his iOS development experience',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
        body: JSON.stringify({ message, history: messages.slice(-10) }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden">
      {/* Messages Area - Full width scroll container with scrollbar at page edge */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2 sm:px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 sm:mb-6">
              <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">Ask me about Rutwik</h2>
            <p className="text-muted-foreground mb-6 sm:mb-10 max-w-lg text-sm sm:text-base leading-relaxed">
              I can help you learn about his experience, skills, projects, and more. Ask me anything!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              {INITIAL_SUGGESTIONS.map(({ text, icon: Icon }, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(`Tell me about Rutwik's ${text.toLowerCase()}`)}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-left group"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-foreground">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                )}
                <div className={`group relative max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'} rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4`}>
                  {msg.role === 'assistant' ? (
                    <>
                      <div className="prose prose-neutral dark:prose-invert prose-sm sm:prose-base max-w-none
                        [&>p]:mb-3 sm:[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-foreground [&>p]:text-sm sm:[&>p]:text-base
                        [&>ul]:mb-3 sm:[&>ul]:mb-4 [&>ul]:space-y-1 [&>ul]:list-disc [&>ul]:pl-4 sm:[&>ul]:pl-5
                        [&>ol]:mb-3 sm:[&>ol]:mb-4 [&>ol]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-4 sm:[&>ol]:pl-5
                        [&_li]:text-foreground [&_li]:leading-relaxed [&_li]:text-sm sm:[&_li]:text-base
                        [&>h1]:text-lg sm:[&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 sm:[&>h1]:mb-4 [&>h1]:text-foreground
                        [&>h2]:text-base sm:[&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 sm:[&>h2]:mb-3 [&>h2]:text-foreground
                        [&>h3]:text-sm sm:[&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:text-foreground
                        [&>*:last-child]:mb-0
                        [&_strong]:text-foreground [&_strong]:font-semibold
                        [&_code]:bg-muted [&_code]:px-1 sm:[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs sm:[&_code]:text-sm
                        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
                        <ReactMarkdown>{msg.content || ''}</ReactMarkdown>
                      </div>
                      {/* Copy button */}
                      {msg.content && (
                        <button
                          onClick={() => copyToClipboard(msg.content, index)}
                          className="absolute -bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-4">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div className="bg-card border border-border rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {/* Follow-up suggestions */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content && currentSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-9 sm:ml-[52px]">
                {currentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-2 sm:p-4 flex-shrink-0 relative z-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 sm:gap-3 bg-card border border-border rounded-xl sm:rounded-2xl p-2 sm:p-3 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-200">
            <textarea
              ref={inputRef}
              placeholder="Ask about Rutwik..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent resize-none px-1 sm:px-2 py-1.5 sm:py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[150px] sm:max-h-[200px] leading-relaxed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="hidden sm:flex items-center justify-center gap-4 mt-3">
            <p className="text-xs text-muted-foreground">
              AI assistant powered by Groq
            </p>
            <span className="text-muted-foreground/30">•</span>
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/types';

const INITIAL_SUGGESTIONS = [
  'Work experience',
  'Technical skills',
  'Projects',
  'Education',
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Generate new suggestions when messages change
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      const available = ALL_FOLLOW_UPS.filter(s => !usedSuggestions.has(s));
      const shuffled = available.sort(() => Math.random() - 0.5);
      setCurrentSuggestions(shuffled.slice(0, 3));
    }
  }, [messages, usedSuggestions]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Track if this was a suggestion
    setUsedSuggestions(prev => new Set(Array.from(prev).concat(message)));

    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply || "Sorry, I couldn't process that request.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-container-modern">
      {/* Messages Area */}
      <div className="chat-messages-area">
        {!hasMessages ? (
          <div className="chat-welcome">
            <div className="welcome-icon">✨</div>
            <h2>Ask me about Rutwik</h2>
            <p>I can help you learn about his experience, skills, projects, and more.</p>

            <div className="suggestion-grid">
              {INITIAL_SUGGESTIONS.map((text, index) => (
                <button
                  key={index}
                  className="suggestion-card"
                  onClick={() => sendMessage(`Tell me about Rutwik's ${text.toLowerCase()}`)}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <div className="avatar user-avatar">You</div>
                  ) : (
                    <div className="avatar ai-avatar">AI</div>
                  )}
                </div>
                <div className="message-body">
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-row assistant">
                <div className="message-avatar">
                  <div className="avatar ai-avatar">AI</div>
                </div>
                <div className="message-body">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up suggestions */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && currentSuggestions.length > 0 && (
              <div className="follow-up-suggestions">
                {currentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="follow-up-btn"
                    onClick={() => sendMessage(suggestion)}
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

      {/* Input Area */}
      <div className="chat-input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper-modern">
            <textarea
              ref={inputRef}
              className="chat-textarea"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            </button>
          </div>
        </form>
        <p className="input-hint">AI assistant powered by Groq • May produce inaccurate information</p>
      </div>
    </div>
  );
}


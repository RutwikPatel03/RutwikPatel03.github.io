import type { Metadata } from 'next';
import Link from 'next/link';
import ChatInterface from '@/components/chat/ChatInterface';

export const metadata: Metadata = {
  title: 'AI Chat | Rutwik Patel',
  description: "Chat with Rutwik's AI assistant to learn about his experience, projects, and skills.",
};

export default function AIPage() {
  return (
    <div className="ai-page">
      {/* Header */}
      <header className="ai-header">
        <Link href="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to Portfolio</span>
        </Link>
        <div className="ai-brand">
          <span className="brand-icon">✨</span>
          <span className="brand-text">Rutwik AI</span>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}


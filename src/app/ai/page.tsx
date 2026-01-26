import type { Metadata } from 'next';
import AIPageClient from './AIPageClient';

export const metadata: Metadata = {
  title: 'AI Chat | Rutwik Patel',
  description: "Chat with Rutwik's AI assistant to learn about his experience, projects, and skills.",
};

export default function AIPage() {
  return <AIPageClient />;
}


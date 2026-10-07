'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import { IdBadge } from '@/components/ui/IdBadge';
import { Lanyard } from '@/components/ui/Lanyard';
import { publications } from '@/data/content';
import { siteConfig } from '@/constants';
import { track } from '@/lib/analytics-client';
import {
  INITIAL_SUGGESTION_TOPICS,
  TOPIC_COMMANDS,
  buildTopicQuestion,
} from '@/lib/chat-prompts';

const ieeePapers = publications.filter((p) => p.publisher === 'IEEE').length;

export default function Hero() {
  const router = useRouter();
  const [question, setQuestion] = useState('');

  // The /ai page sends ?q= as its first message; an empty box just opens the chat.
  const askAI = (q: string) => {
    const trimmed = q.trim();
    router.push(trimmed ? `/ai?q=${encodeURIComponent(trimmed)}` : '/ai');
  };

  const handleAsk = (e: FormEvent) => {
    e.preventDefault();
    track('chat_topic', 'hero_question');
    askAI(question);
  };

  return (
    <section className="bg-dots relative overflow-hidden bg-paper pt-[72px]">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-12 px-4 pb-20 pt-6 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-12">
        {/* The badge, hanging from a lanyard that runs off the top of the page */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="order-1 flex shrink-0 flex-col items-center lg:order-2"
        >
          {/* Hangs from the bottom edge of the header rather than through it. */}
          <Lanyard length={120} label="RUTWIK.DEV · ALL ACCESS" className="-mt-6" />
          <div className="-mt-1 animate-sway [transform-origin:50%_-200px]">
            <IdBadge compact className="sm:hidden" />
            <IdBadge className="hidden sm:block" />
          </div>
          <span className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-taupe">
            <span className="hidden md:inline">Move to tilt · </span>Click to flip
          </span>
        </motion.div>

        {/* Who */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="order-2 flex w-full max-w-[460px] flex-col gap-6 lg:order-1"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-3 py-1 text-sm text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Open to opportunities
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-taupe">
              <MapPin className="h-3.5 w-3.5" />
              {siteConfig.author.location}
            </span>
          </div>
          <h1 className="font-display text-[clamp(44px,5.6vw,84px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
            <span className="mb-4 block font-mono text-[13px] font-normal uppercase tracking-[0.12em] text-taupe">
              {siteConfig.name}
            </span>
            Software &amp;{' '}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-cardinal">Infrastructure</span>{' '}
            Engineer.
          </h1>
          <p className="text-lg leading-relaxed text-[#2C2925] sm:text-[19px]">
            Backend, cloud infrastructure and applied AI. MS CS from USC, engineering roles at Sigma Computing and
            World Salon, and published in IEEE.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="#projects"
              className="inline-flex h-[50px] items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-ink-soft"
            >
              See my work
              <ArrowRight className="h-4 w-4" />
            </a>
            {/* A plain anchor, not next/link: Link prefetches its href as a
                route, and /resume.pdf is a static file, so every homepage
                load fired a 404 for /resume.pdf?_rsc=... */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('resume_download', 'hero')}
              className="inline-flex h-[50px] items-center gap-2 rounded-full border-[1.5px] border-ink px-6 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <Download className="h-4 w-4" />
              Resume
            </a>
          </div>
        </motion.div>

        {/* Ask, and the stamps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="order-3 flex w-full max-w-[380px] flex-col gap-5"
        >
          <form
            onSubmit={handleAsk}
            className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 shadow-[0_16px_40px_rgba(16,16,18,0.08)]"
          >
            <label htmlFor="hero-ask" className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              Ask the badge holder
            </label>
            <div className="flex gap-2">
              <input
                id="hero-ask"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={2000}
                placeholder='Try "Tell me about Sigma"'
                className="h-12 min-w-0 flex-1 rounded-[14px] border border-[#CFC7B6] bg-[#F7F5EF] px-3.5 text-base text-ink placeholder:text-taupe focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Ask"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-ink text-paper transition-colors hover:bg-cardinal"
              >
                <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_SUGGESTION_TOPICS.map((topic, i) => (
                <button
                  key={topic}
                  type="button"
                  title={topic}
                  onClick={() => {
                    track('chat_topic', `hero:${topic}`);
                    askAI(buildTopicQuestion(topic));
                  }}
                  className="min-h-9 rounded-full border border-line px-3 font-mono text-xs text-taupe transition-colors hover:border-cardinal hover:text-cardinal"
                >
                  {TOPIC_COMMANDS[i]}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-taupe">Answers come from my portfolio, with project and role cards.</span>
          </form>
          <div className="flex flex-wrap gap-3">
            <Stamp value="60+" label={'ENTERPRISE\nORGS'} className="-rotate-[10deg] border-2 border-dashed border-cardinal text-cardinal" />
            <Stamp value="130+" label={'EVENTS\nSHIPPED'} className="rotate-6 border-2 border-dashed border-ink text-ink" />
            <Stamp value="IEEE" label={`PUBLISHED\n${ieeePapers === 2 ? 'TWICE' : `${ieeePapers}X`}`} className="-rotate-[4deg] bg-gold text-ink" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stamp({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <span className={`flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full text-center ${className}`}>
      <span className="font-display text-3xl font-extrabold leading-none tracking-[-0.04em]">{value}</span>
      <span className="mt-1 whitespace-pre-line font-mono text-[10px] tracking-[0.08em]">{label}</span>
    </span>
  );
}

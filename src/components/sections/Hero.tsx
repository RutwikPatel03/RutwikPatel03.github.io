'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUp, Download, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks';
import { track } from '@/lib/analytics-client';
import { INITIAL_SUGGESTION_TOPICS, buildTopicQuestion } from '@/lib/chat-prompts';

const TITLES = [
  'Software Engineer',
  'Infrastructure Engineer',
  'Backend & Systems Engineer',
  'Full Stack Developer',
  'USC CS Graduate',
];

export default function Hero() {
  const { text } = useTypewriter({
    words: TITLES,
    typeSpeed: 80,
    deleteSpeed: 40,
    delayBetweenWords: 2500,
  });
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--muted-foreground) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Status Badge + Location */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Open to opportunities
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                San Francisco, CA
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight"
            >
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Rutwik Patel
              </span>
            </motion.h1>

            {/* Title with Typewriter Effect */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 text-xl sm:text-2xl text-muted-foreground h-8 sm:h-9"
            >
              <span>{text}</span>
              <span className="inline-block w-0.5 h-6 sm:h-7 bg-blue-500 ml-1 animate-pulse" />
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              I&apos;m a software engineer. Most recently, I shipped features at Sigma Computing that 60+ companies depend on. I studied CS at USC and have published research with IEEE. I&apos;ve also built a few projects I&apos;m really proud of. Check them out below.
            </motion.p>

            {/* Ask AI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-7 w-full max-w-xl mx-auto lg:mx-0"
            >
              <form
                onSubmit={handleAsk}
                className="rounded-2xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_48px_rgba(168,85,247,0.28)]"
              >
                <div className="flex items-center gap-3 rounded-[14px] bg-background py-2 pl-4 pr-2">
                  <Sparkles className="w-5 h-5 shrink-0 text-purple-400" aria-hidden="true" />
                  <label htmlFor="hero-ask" className="sr-only">
                    Ask my AI about me
                  </label>
                  <input
                    id="hero-ask"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={2000}
                    placeholder="Ask my AI anything about me…"
                    className="min-w-0 flex-1 h-11 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Ask"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 to-purple-500 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ArrowUp className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </form>
              <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-[13px] text-muted-foreground">Try</span>
                {INITIAL_SUGGESTION_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      track('chat_topic', `hero:${topic}`);
                      askAI(buildTopicQuestion(topic));
                    }}
                    className="rounded-full border border-border bg-background px-3.5 py-1.5 text-[13px] text-foreground/80 transition-colors hover:border-purple-500/40 hover:text-foreground"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-7 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Button>
              {/* A plain anchor, not next/link: Link prefetches its href as a
                  route, and /resume.pdf is a static file, so every homepage
                  load fired a 404 for /resume.pdf?_rsc=... */}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
                onClick={() => track('resume_download', 'hero')}
              >
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  <Download className="w-4 h-4" />
                  Resume
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-border bg-muted">
              <Image
                src="/myimg/me.jpg"
                alt="Rutwik Patel - Software Engineer at Sigma Computing, USC MS Computer Science Graduate, Full-Stack Developer specializing in React, TypeScript, Python, and AI/ML"
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 256px, 320px"
                quality={85}
              />
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border border-border/50 -m-4" />
            <div className="absolute inset-0 rounded-full border border-border/30 -m-8" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-muted-foreground/50 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}


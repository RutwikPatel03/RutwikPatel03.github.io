'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks';

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
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Open to opportunities
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
              I build and ship software that people actually use — from enterprise data products to backend services, infrastructure, and AI-driven systems. I care about performance, reliability, and real-world impact (I wrote a Redis-compatible store in C++ that hits 984K+ ops/sec). USC MS Computer Science. Published IEEE researcher.
            </motion.p>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-muted-foreground"
            >
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Link href="/ai" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4" />
                  Ask AI About Me
                </Button>
              </Link>
              <Link href="/resume.pdf" target="_blank" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  <Download className="w-4 h-4" />
                  Resume
                </Button>
              </Link>
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


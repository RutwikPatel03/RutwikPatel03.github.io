'use client';

import { motion } from 'motion/react';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle, BentoCardDescription, BentoCardContent } from '@/components/ui/BentoGrid';
import GitHubActivity from '@/components/ui/GitHubActivity';
import SkillProof from '@/components/ui/SkillProof';

const stats = [
  // TEMPORARILY HIDDEN (2026-08-29): miniredis is off the public site for now.
  // { value: '984K', label: 'ops/sec on miniredis (C++)' },
  { value: '58K+', label: 'Profiles Processed via AI Pipelines' },
  { value: '500GB+', label: 'Data Indexed for RAG Retrieval' },
  { value: '60+', label: 'Enterprises Using Shipped Features' },
  { value: '3.81', label: 'Graduate GPA' },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            About Me
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Software Engineer passionate about building scalable products and solving complex problems
          </p>
        </motion.div>

        <BentoGrid className="gap-4">
          {/* Bio Card - Full Width */}
          <BentoCard colSpan={3}>
            <BentoCardHeader>
              <BentoCardTitle>Who I Am</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <BentoCardDescription className="text-sm sm:text-base leading-relaxed">
                I&apos;m a Software Engineer and USC Master&apos;s graduate who works close to the systems layer — backend services, infrastructure, and applied AI — and enjoys making complex things fast and reliable.
                <br /><br />
                At Sigma Computing I shipped four production features used by 60+ enterprise organizations, and optimized rendering of large data grids with memoization and virtualization. At World Salon I refactored a monolithic backend into modular payment and event services (cutting request latency by 20%), built OpenAI-powered pipelines that processed 58,000+ profiles end-to-end, and containerized and deployed everything on AWS with Docker, EC2, S3, and GitHub Actions.
                <br /><br />
                As a Research Assistant at USC Marshall, I engineered fault-tolerant ETL pipelines and RAG semantic-search systems over 500GB+ of sustainability disclosures, indexing 2M+ data points in PostgreSQL for 30+ researchers.
                <br /><br />
                {/* TEMPORARILY HIDDEN (2026-08-29): miniredis paragraph. Restore with:
                For fun and depth, I build systems from scratch — like <span className="font-medium text-foreground">miniredis</span>, a Redis-compatible in-memory store written in C++17 with a non-blocking epoll/kqueue reactor and a hand-written skip list, reaching 984K+ ops/sec.
                <br /><br /> */}
                I&apos;m open to full-time roles in Software, Infrastructure, Backend, and AI Engineering. Happy to connect with engineers, founders, and recruiters.
              </BentoCardDescription>
            </BentoCardContent>
          </BentoCard>

          {/* Stats Card - Full Width Below */}
          <BentoCard colSpan={3}>
            <BentoCardHeader>
              <BentoCardTitle>Impact</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              {/* md:grid-cols-4 matches the 4 visible stats. Restore md:grid-cols-5
                  when the miniredis stat above is uncommented. */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-2 sm:p-0">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </BentoCardContent>
          </BentoCard>

          {/* GitHub Activity Card */}
          <GitHubActivity />

          <SkillProof />
        </BentoGrid>
      </div>
    </section>
  );
}


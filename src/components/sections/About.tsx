'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import GitHubActivity from '@/components/ui/GitHubActivity';
import SkillProof from '@/components/ui/SkillProof';
import { experience, education, publications } from '@/data/content';
import { siteConfig, socialLinks } from '@/constants';
import { track } from '@/lib/analytics-client';

const stats = [
  // TEMPORARILY HIDDEN (2026-08-29): miniredis is off the public site for now.
  // { value: '984K', label: 'ops/sec on miniredis (C++)' },
  { value: '58K+', label: 'Profiles Processed via AI Pipelines' },
  { value: '500GB+', label: 'Data Indexed for RAG Retrieval' },
  { value: '60+', label: 'Enterprises Using Shipped Features' },
  { value: '3.81', label: 'Graduate GPA' },
];

// "Masters of Science in Computer Science | GPA: 3.81/4.0" -> "3.81"
const gpaOf = (degree: string) => degree.match(/GPA:\s*([\d.]+)/)?.[1];
const [masters, bachelors] = education;
const mostRecent = experience[0];
const ieeePapers = publications.filter((p) => p.publisher === 'IEEE').length;

const fields: { label: string; value: string }[] = [
  { label: 'NAME', value: siteConfig.name },
  { label: 'ROLE', value: 'Software & Infrastructure Engineer' },
  { label: 'BASED IN', value: siteConfig.author.location },
  {
    label: 'EDUCATION',
    value: `MS CS, USC (${gpaOf(masters.degree)}) · B.Tech IT, Mumbai (${gpaOf(bachelors.degree)})`,
  },
  { label: 'MOST RECENT', value: `${mostRecent.title}, ${mostRecent.company.split(',')[0].replace(' School of Business', '')}` },
  { label: 'PUBLISHED', value: `${publications.length} papers, ${ieeePapers} in IEEE` },
  { label: 'OPEN TO', value: 'Full-time Software, Infrastructure, Backend and AI roles' },
];

export default function About() {
  return (
    <section id="about" className="bg-paper-deep px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader
          eyebrow="01 About"
          title="Holder"
          accent="details."
          subtitle="The fine print on the badge, written out. Everything here is also what my AI assistant answers from."
        />

        {/* The holder record */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_70px_rgba(16,16,18,0.12)]"
        >
          <div className="flex items-center justify-between gap-3 bg-ink px-7 py-4 font-mono text-xs tracking-[0.14em] text-paper">
            <span>HOLDER RECORD</span>
            <span className="text-gold">RUTWIK.DEV</span>
          </div>

          <div className="flex flex-wrap gap-11 px-6 py-9 sm:px-8">
            <div className="flex flex-[0_0_240px] flex-col gap-6">
              <div className="relative w-[220px]">
                <div className="h-[270px] w-[220px] -rotate-[2.5deg] overflow-hidden rounded-md border-8 border-paper shadow-[0_10px_24px_rgba(16,16,18,0.18)]">
                  <div className="relative h-full w-full">
                    <Image
                      src="/myimg/me.jpg"
                      alt={siteConfig.name}
                      fill
                      sizes="204px"
                      className="object-cover object-[center_26%]"
                    />
                  </div>
                </div>
                {/* Paper clip */}
                <svg width="34" height="74" viewBox="0 0 34 74" aria-hidden="true" className="absolute -top-[26px] left-7">
                  <path
                    d="M10 64V14a7 7 0 0 1 14 0v44a4 4 0 0 1-8 0V18"
                    fill="none"
                    stroke="#8C867B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-[18px] -right-6 flex h-[104px] w-[104px] -rotate-[14deg] flex-col items-center justify-center rounded-full border-[3px] border-double border-cardinal bg-white/75 text-center text-cardinal"
                >
                  <span className="font-mono text-[10px] tracking-[0.12em]">USC</span>
                  <span className="font-display text-xl font-extrabold leading-none">
                    CLASS
                    <br />
                    OF 2025
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-3">
                <span className="origin-left -rotate-3 font-serif text-[46px] italic leading-none text-[#1E2A5A]">
                  {siteConfig.name}
                </span>
                <span className="border-t border-ink pt-1.5 font-mono text-[11px] tracking-[0.12em] text-taupe">
                  HOLDER SIGNATURE
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
              <p className="text-lg leading-relaxed text-[#2C2925] sm:text-xl">
                I work across backend, cloud infrastructure and applied AI. I&apos;ve shipped React features used by
                60+ enterprise organizations at Sigma Computing, launched the events platform behind 130+ events at
                World Salon, and built RAG search over sustainability disclosures at USC Marshall.
              </p>

              <dl className="flex flex-col">
                {fields.map((field) => (
                  <div key={field.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                    <dt className="shrink-0 font-mono text-xs tracking-[0.12em] text-taupe">{field.label}</dt>
                    <span aria-hidden="true" className="hidden flex-1 -translate-y-1 border-b-2 border-dotted border-[#CFC7B6] sm:block" />
                    <dd className="text-base font-semibold text-ink sm:text-right sm:text-[17px]">{field.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-paper px-3 py-3">
                    <div className="font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">{stat.value}</div>
                    <div className="text-[11px] leading-tight text-taupe">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('resume_download', 'about')}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-paper transition-colors hover:bg-ink-soft"
                >
                  Download resume
                  <Download className="h-4 w-4" />
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('outbound_click', 'LinkedIn')}
                  className="inline-flex h-12 items-center rounded-full border-[1.5px] border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  LinkedIn
                </a>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('outbound_click', 'GitHub')}
                  className="inline-flex h-12 items-center rounded-full border-[1.5px] border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="h-3 bg-[repeating-linear-gradient(90deg,#C8102E_0_40px,#FFCC00_40px_52px)]" />
        </motion.div>

        {/* Skills, as clearance levels, and live GitHub activity */}
        <BentoGrid className="mt-6 gap-6">
          <SkillProof />
          <GitHubActivity />
        </BentoGrid>
      </div>
    </section>
  );
}

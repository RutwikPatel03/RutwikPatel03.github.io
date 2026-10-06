'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { publications } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PunchSlot } from '@/components/ui/Lanyard';
import { cn } from '@/lib/utils';

// Each paper is a press pass. IEEE gets the black band; the rest alternate
// cardinal and gold so neighbors differ.
const OTHER_BANDS = ['bg-cardinal text-white', 'bg-gold text-ink'];
const TILTS = ['-rotate-[1.5deg]', 'rotate-1 lg:mt-9', '-rotate-[0.8deg]', 'rotate-[1.6deg] lg:mt-9'];

const yearOf = (date: string) => date.match(/\d{4}/)?.[0] ?? date;

export default function Publications() {
  const ieeeCount = publications.filter((p) => p.publisher === 'IEEE').length;
  let other = 0;

  return (
    <section id="publications" className="bg-paper px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          eyebrow="04 Publications"
          title="Press"
          accent="passes."
          subtitle={`${publications.length} peer-reviewed papers on explainable AI, privacy and learning tools. ${ieeeCount} are in IEEE.`}
        />

        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {publications.map((pub, index) => {
            const isIeee = pub.publisher === 'IEEE';
            const band = isIeee ? 'bg-ink text-paper' : OTHER_BANDS[other++ % OTHER_BANDS.length];
            return (
              <motion.a
                key={pub.title}
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cn(
                  'group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_rgba(16,16,18,0.1)] transition-transform duration-300 hover:-translate-y-2',
                  TILTS[index % TILTS.length]
                )}
              >
                <PunchSlot />
                <span className={cn('mx-3.5 flex items-center justify-between rounded-xl px-3.5 py-2.5', band)}>
                  <span className="font-display text-lg font-extrabold">PRESS</span>
                  <span className={cn('font-mono text-xs', isIeee && 'text-gold')}>
                    {pub.publisher.toUpperCase()} · {yearOf(pub.date)}
                  </span>
                </span>
                <span className="relative mx-3.5 mt-3 h-[150px] overflow-hidden rounded-xl border border-[#E2DCCD]">
                  <Image
                    src={pub.image}
                    alt={`First page of ${pub.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top"
                  />
                </span>
                <span className="flex flex-col gap-2 px-[18px] pb-5 pt-4">
                  <span className="font-display text-xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">{pub.title}</span>
                  <span className="text-[13px] text-taupe">{pub.publishedIn}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-cardinal">
                    {isIeee ? 'Read on IEEE Xplore' : 'Read the paper'}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

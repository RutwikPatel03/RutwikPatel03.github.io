'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Briefcase, FolderGit2, GraduationCap } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardDescription, BentoCardContent } from '@/components/ui/BentoGrid';
import { skillCategories } from '@/data/content';
import { proofFor, type Proof } from '@/lib/skill-proof';
import { cn } from '@/lib/utils';

// Each skill family is a clearance zone with its own band color, like the
// colored stripes on a conference badge.
const zoneStyles: Record<string, { band: string; text: string }> = {
  Languages: { band: '#101012', text: '#F3F0E8' },
  Frontend: { band: '#E9E4D8', text: '#101012' },
  Backend: { band: '#5E5950', text: '#FFFFFF' },
  Databases: { band: '#FFCC00', text: '#101012' },
  'Cloud & Infra': { band: '#2A2A30', text: '#F3F0E8' },
  'AI / ML': { band: '#C8102E', text: '#FFFFFF' },
};
const fallbackZone = { band: '#101012', text: '#F3F0E8' };

interface Entry {
  name: string;
  category: string;
  zone: string;
  proof: Proof[];
}

// Content is static, so the proof is worked out once rather than per render.
const entries: Entry[] = skillCategories.flatMap((category, i) =>
  category.skills.map((skill) => ({
    name: skill.name,
    category: category.title,
    zone: String.fromCharCode(65 + i),
    proof: proofFor(skill),
  }))
);

// Open on the best-evidenced skill so the panel is never empty on arrival.
const mostProven = entries.reduce((best, entry) => (entry.proof.length > best.proof.length ? entry : best));

export default function SkillProof() {
  const [selectedName, setSelectedName] = useState(mostProven.name);
  const selected = useMemo(
    () => entries.find((entry) => entry.name === selectedName) ?? mostProven,
    [selectedName]
  );

  return (
    <BentoCard colSpan={3}>
      <BentoCardHeader>
        <p className="mb-2 font-mono text-[13px] uppercase tracking-[0.12em] text-taupe">Clearance levels</p>
        <BentoCardTitle className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink">Toolkit</BentoCardTitle>
        <BentoCardDescription className="mt-1 text-taupe">
          Scan a skill to see where I&apos;ve used it. The number is how many roles and projects on this site use it.
        </BentoCardDescription>
      </BentoCardHeader>
      <BentoCardContent>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {skillCategories.map((category) => {
              const style = zoneStyles[category.title] ?? fallbackZone;
              const zoneEntries = entries.filter((entry) => entry.category === category.title);
              return (
                <div key={category.title} className="overflow-hidden rounded-[20px] border border-line">
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ backgroundColor: style.band, color: style.text }}
                  >
                    <h4 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">{category.title}</h4>
                    <span className="font-mono text-[11px] tracking-[0.12em]">ZONE {zoneEntries[0]?.zone}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3.5">
                    {zoneEntries.map((entry) => (
                      <SkillChip
                        key={entry.name}
                        entry={entry}
                        active={entry.name === selected.name}
                        onSelect={() => setSelectedName(entry.name)}
                      />
                    ))}
                  </div>
                  {/* On a phone the panel opens right under the chip that was
                      tapped; a side panel would be a screen away. */}
                  {selected.category === category.title && (
                    <div className="p-3.5 pt-0 lg:hidden">
                      <ProofPanel entry={selected} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <ProofPanel entry={selected} />
          </div>
        </div>
      </BentoCardContent>
    </BentoCard>
  );
}

function SkillChip({ entry, active, onSelect }: { entry: Entry; active: boolean; onSelect: () => void }) {
  const count = entry.proof.length;

  // Nothing on the site backs this one up, so there is nothing to open.
  if (count === 0) {
    return (
      <span data-unbacked={entry.name} className="rounded-xl border border-line px-3 py-2 text-sm text-taupe">
        {entry.name}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-skill={entry.name}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-xl border-[1.5px] pl-3.5 pr-2 text-[15px] font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cardinal focus-visible:ring-offset-2',
        active ? 'border-ink bg-ink text-paper' : 'border-[#E2DCCD] bg-[#F7F5EF] text-ink hover:border-ink'
      )}
    >
      {entry.name}
      <span
        className={cn(
          'flex h-[26px] min-w-[26px] items-center justify-center rounded-lg px-1.5 font-mono text-xs tabular-nums',
          active ? 'bg-gold text-ink' : 'bg-paper-deep text-ink'
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ProofPanel({ entry }: { entry: Entry }) {
  const count = entry.proof.length;

  return (
    <div aria-live="polite" className="flex flex-col gap-4 rounded-[26px] bg-ink p-5 text-paper shadow-[0_30px_60px_rgba(16,16,18,0.3)]">
      <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-[#A8A296]">
        <span>CLEARANCE SCANNER</span>
        <span className="inline-flex items-center gap-1.5 text-[#7CE38B]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#7CE38B]" />
          READY
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={entry.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          <div className="relative flex flex-col gap-2 overflow-hidden rounded-[18px] border border-white/10 bg-ink-soft p-5">
            <span aria-hidden="true" className="absolute inset-x-0 h-[3px] animate-scan bg-cardinal shadow-[0_0_18px_#C8102E]" />
            <p className="font-mono text-xs tracking-[0.12em] text-gold">
              ZONE {entry.zone} · {entry.category.toUpperCase()}
            </p>
            <h4 className="font-display text-[36px] font-extrabold leading-none tracking-[-0.04em]">{entry.name}</h4>
            <p className="text-sm text-[#CFC9BD]">
              {count} {count === 1 ? 'record' : 'records'} found
            </p>
          </div>

          <ul className="flex flex-col gap-1">
            {entry.proof.map((proof, i) => (
              <motion.li
                key={`${proof.kind}:${proof.title}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.05 + i * 0.05 }}
              >
                <ProofLink proof={proof} />
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProofLink({ proof }: { proof: Proof }) {
  // A thumbnail that fails to load falls back to the icon tile, not a broken image.
  const [imageFailed, setImageFailed] = useState(false);
  const Arrow = proof.external ? ArrowUpRight : ArrowRight;
  const KindIcon = { role: Briefcase, education: GraduationCap, project: FolderGit2 }[proof.kind];
  const body = (
    <>
      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 bg-ink-soft">
        {proof.image && !imageFailed ? (
          <Image
            src={proof.image}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            unoptimized={proof.image.endsWith('.svg')}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gold">
            <KindIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-paper">{proof.title}</p>
        <p className="line-clamp-2 text-xs text-[#A8A296]">{proof.subtitle}</p>
      </div>
      <Arrow className="h-4 w-4 shrink-0 text-[#A8A296] transition-transform group-hover:translate-x-0.5" />
    </>
  );

  const className =
    'group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-white/15 hover:bg-white/5';

  if (proof.external) {
    return (
      <a href={proof.href} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }
  return (
    <Link href={proof.href} className={className}>
      {body}
    </Link>
  );
}

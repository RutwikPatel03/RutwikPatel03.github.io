'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Briefcase, FolderGit2 } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardDescription, BentoCardContent } from '@/components/ui/BentoGrid';
import { skillCategories } from '@/data/content';
import { proofFor, type Proof } from '@/lib/skill-proof';
import { cn } from '@/lib/utils';

const tailwindColorToHex: Record<string, string> = {
  'text-blue-500': '#3b82f6',
  'text-purple-500': '#a855f7',
  'text-green-500': '#22c55e',
  'text-orange-500': '#f97316',
  'text-cyan-500': '#06b6d4',
  'text-pink-500': '#ec4899',
};

interface Entry {
  name: string;
  category: string;
  accent: string;
  proof: Proof[];
}

// Content is static, so the proof is worked out once rather than per render.
const entries: Entry[] = skillCategories.flatMap((category) =>
  category.skills.map((skill) => ({
    name: skill.name,
    category: category.title,
    accent: tailwindColorToHex[category.color] ?? '#6366f1',
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
        <BentoCardTitle>Toolkit</BentoCardTitle>
        <BentoCardDescription className="mt-1">
          Pick a skill to see where I&apos;ve used it. The number is how many roles and projects on this site use it.
        </BentoCardDescription>
      </BentoCardHeader>
      <BentoCardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {skillCategories.map((category) => (
              <div key={category.title}>
                <div className="mb-2.5 flex items-center gap-2">
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {category.title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entries
                    .filter((entry) => entry.category === category.title)
                    .map((entry) => (
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
                  <div className="mt-4 lg:hidden">
                    <ProofPanel entry={selected} />
                  </div>
                )}
              </div>
            ))}
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
      <span className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-muted-foreground">
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
        'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_8px_24px_-8px_var(--accent)]'
          : 'border-border text-foreground hover:-translate-y-0.5 hover:border-[var(--accent)]'
      )}
      style={{ '--accent': entry.accent } as CSSProperties}
    >
      {entry.name}
      <span
        className={cn(
          'min-w-[1.25rem] rounded-full px-1.5 text-center text-xs font-semibold tabular-nums',
          active ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
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
    <div
      aria-live="polite"
      className="relative overflow-hidden rounded-xl border border-border bg-background/60 p-5"
      style={{ borderTopColor: entry.accent, borderTopWidth: 3 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: entry.accent }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={entry.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: entry.accent }}>
            {entry.category}
          </p>
          <h4 className="mt-1 font-heading text-2xl font-bold text-foreground">{entry.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Used in {count} {count === 1 ? 'place' : 'places'}
          </p>

          <ul className="mt-4 space-y-2">
            {entry.proof.map((proof, i) => (
              <motion.li
                key={`${proof.kind}:${proof.title}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.05 + i * 0.05 }}
              >
                <ProofLink proof={proof} accent={entry.accent} />
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProofLink({ proof, accent }: { proof: Proof; accent: string }) {
  // A thumbnail that fails to load falls back to the icon tile, not a broken image.
  const [imageFailed, setImageFailed] = useState(false);
  const Arrow = proof.external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
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
          <div className="flex h-full w-full items-center justify-center" style={{ color: accent, backgroundColor: `${accent}1f` }}>
            {proof.kind === 'role' ? <Briefcase className="h-5 w-5" /> : <FolderGit2 className="h-5 w-5" />}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{proof.title}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{proof.subtitle}</p>
      </div>
      <Arrow className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </>
  );

  const className =
    'group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50';

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

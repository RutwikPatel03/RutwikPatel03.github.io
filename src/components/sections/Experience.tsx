'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { experience, education } from '@/data/content';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Barcode } from '@/components/ui/Barcode';
import { Lanyard, PunchSlot } from '@/components/ui/Lanyard';
import { cn } from '@/lib/utils';

// ===========================================
// Badges
// ===========================================

interface Org {
  /** Matched against the start of a role's company or a degree's school. */
  match: string;
  short: string;
  /** Printed in the barcode, with a two-digit start year. */
  code: string;
  logo?: { src: string; bg: string; pad: string };
}

// Logos come from each organization's own site. Mumbai has none on file, so
// its badge shows the name in type instead.
const ORGS: Org[] = [
  { match: 'USC Marshall', short: 'USC Marshall', code: 'USCM', logo: { src: '/logos/usc-marshall.png', bg: '#FFFFFF', pad: 'p-1' } },
  { match: 'Sigma', short: 'Sigma Computing', code: 'SIGMA', logo: { src: '/logos/sigma.png', bg: '#1C1C1C', pad: 'p-0' } },
  { match: 'World Salon', short: 'World Salon', code: 'WSALON', logo: { src: '/logos/world-salon.png', bg: '#FFFFFF', pad: 'px-3 py-2.5' } },
  { match: 'University of Southern California', short: 'USC', code: 'USC-MS', logo: { src: '/logos/usc.png', bg: '#990000', pad: 'p-0' } },
  { match: 'University of Mumbai', short: 'University of Mumbai', code: 'MUMBAI' },
];

// Strap and header band colors, in badge order, so neighbors never match.
const STRAPS = ['#C8102E', '#F3F0E8', '#FFCC00', '#E8566B', '#990000', '#8C847A'];
const BANDS = [
  { bg: '#101012', fg: '#F3F0E8' },
  { bg: '#C8102E', fg: '#FFFFFF' },
  { bg: '#FFCC00', fg: '#101012' },
  { bg: '#101012', fg: '#F3F0E8' },
  { bg: '#FFCC00', fg: '#101012' },
  { bg: '#E9E4D8', fg: '#101012' },
];
// Staggered so the badges hang at different heights from the rail.
const DROPS = [120, 160, 96, 140, 110, 150];

interface Badge {
  type: string;
  year: string;
  role: string;
  /** What fits on the badge itself. */
  badgeRole: string;
  org: string;
  place?: string;
  period: string;
  points: string[];
  stack: string[];
  links: { text: string; link: string }[];
  logo?: Org['logo'];
  barcode: string;
}

const startYear = (period: string) => period.match(/\d{4}/)?.[0] ?? '';
// Degree names run four lines on a 190px badge; the panel keeps the full name.
const shortDegree = (degree: string) =>
  degree.replace(/^Masters? of Science in /, 'MS, ').replace(/^Bachelor of Technology in /, 'B.Tech, ');
const findOrg = (name: string) => ORGS.find((org) => name.startsWith(org.match));

const roleBadges: Badge[] = experience.map((role) => {
  const [orgName, ...placeParts] = role.company.split(', ');
  const org = findOrg(orgName);
  const year = startYear(role.period);
  return {
    type: /intern/i.test(role.title) ? 'INTERN' : /research/i.test(role.title) ? 'RESEARCH' : 'STAFF',
    year,
    role: role.title,
    badgeRole: role.title,
    org: org?.short ?? orgName,
    place: placeParts.join(', ') || undefined,
    period: role.period,
    points: role.description,
    stack: role.stack ?? [],
    links: role.highlights ?? [],
    logo: org?.logo,
    barcode: `${org?.code ?? 'ROLE'}-${year.slice(2)}`,
  };
});

const schoolBadges: Badge[] = education.map((school) => {
  const [schoolName] = school.school.split(', ');
  const org = findOrg(schoolName);
  const year = startYear(school.period);
  // "Masters of Science in Computer Science | GPA: 3.81/4.0"
  const degree = school.degree.split('|')[0].trim();
  return {
    type: 'STUDENT',
    year,
    role: degree,
    badgeRole: shortDegree(degree),
    org: org?.short ?? schoolName,
    period: school.period,
    points: [school.degree.split('|')[1]?.trim(), school.description].filter((p): p is string => !!p),
    stack: school.stack ?? [],
    links: [],
    logo: org?.logo,
    barcode: `${org?.code ?? 'EDU'}-${year.slice(2)}`,
  };
});

const badges = [...roleBadges, ...schoolBadges];

// ===========================================
// Section
// ===========================================

export default function Experience() {
  // Open on the first role so the details panel is never empty.
  const [picked, setPicked] = useState(0);
  const selected = badges[picked];

  return (
    <section id="experience" className="bg-ink px-4 py-24 text-paper sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          tone="ink"
          eyebrow="02 Experience"
          title="Badges"
          accent="collected."
          subtitle={`${roleBadges.length} roles and ${schoolBadges.length} degrees, each with the badge I wore. Pick one up to read it.`}
        />

        {/* The rail the lanyards hang from */}
        <div>
          <div aria-hidden="true" className="h-[18px] rounded-full bg-gradient-to-b from-[#4A4741] to-[#26252A] shadow-[0_6px_14px_rgba(0,0,0,0.5)]" />
          {/* Padding keeps the picked badge's yellow ring inside the scroll box. */}
          <div className="flex justify-between gap-3 overflow-x-auto px-2 pb-6 lg:justify-around" role="group" aria-label="Roles and degrees">
            {badges.map((badge, i) => {
              const active = picked === i;
              const band = BANDS[i % BANDS.length];
              return (
                <div key={`${badge.org}-${badge.period}`} className="flex flex-[0_0_190px] flex-col items-center">
                  <Lanyard
                    color={STRAPS[i % STRAPS.length]}
                    length={(DROPS[i % DROPS.length]) + (active ? 36 : 0)}
                  />
                  <button
                    type="button"
                    onClick={() => setPicked(i)}
                    aria-pressed={active}
                    aria-label={`${badge.role}, ${badge.org}`}
                    className={cn(
                      'mt-1 flex h-[312px] w-[190px] flex-col overflow-hidden rounded-[20px] bg-white text-left text-ink transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:brightness-[1.03]',
                      // The picked badge lifts instead of scaling: a scaled
                      // barcode lands between pixels and stops scanning.
                      active
                        ? '-translate-y-2 shadow-[0_0_0_4px_#101012,0_0_0_7px_#FFCC00,0_30px_60px_rgba(0,0,0,0.6)]'
                        : 'shadow-[0_18px_36px_rgba(0,0,0,0.45)]'
                    )}
                  >
                    <PunchSlot className="h-5" />
                    <span
                      className="mx-3 flex items-center justify-between rounded-xl px-3 py-2.5 font-mono text-[11px] tracking-[0.12em]"
                      style={{ backgroundColor: band.bg, color: band.fg }}
                    >
                      <span>{badge.type}</span>
                      <span>{badge.year}</span>
                    </span>
                    <span
                      className={cn(
                        'mx-3 mt-3 flex h-[104px] items-center justify-center overflow-hidden rounded-xl border border-[#E2DCCD]',
                        badge.logo?.pad ?? 'p-2'
                      )}
                      style={{ backgroundColor: badge.logo?.bg ?? '#F3F0E8' }}
                    >
                      {badge.logo ? (
                        <Image
                          src={badge.logo.src}
                          alt={`${badge.org} logo`}
                          width={180}
                          height={180}
                          className={cn(
                            'max-h-full w-auto max-w-full object-contain transition-[filter] duration-300',
                            // Older badges fade a little, like ones worn for a while.
                            !active && i > 0 && 'saturate-[0.7]'
                          )}
                        />
                      ) : (
                        <span className="whitespace-pre-line text-center font-serif text-[25px] leading-[1.05]">{badge.org.replace(' of ', '\nof ')}</span>
                      )}
                    </span>
                    <span className="flex flex-col gap-1 px-3.5 pt-3.5">
                      <span className="font-display text-[19px] font-extrabold leading-[1.05] tracking-[-0.02em]">{badge.badgeRole}</span>
                      <span className="text-[13px] text-taupe">{badge.org}</span>
                    </span>
                    <span className="mx-auto mb-3.5 mt-auto">
                      <Barcode value={badge.barcode} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* The picked badge, read out */}
        <motion.div
          key={picked}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-live="polite"
          className="mt-4 flex flex-wrap gap-8 rounded-[28px] border border-white/10 bg-ink-soft p-6 sm:p-8"
        >
          <div className="flex flex-[1_1_280px] flex-col gap-2.5">
            <span
              className="self-start rounded-full px-3 py-1.5 font-mono text-xs tracking-[0.1em]"
              style={{ backgroundColor: BANDS[picked % BANDS.length].bg === '#101012' ? '#FFCC00' : BANDS[picked % BANDS.length].bg, color: '#101012' }}
            >
              {selected.type} · {selected.period}
            </span>
            <h3 className="font-display text-[clamp(30px,3.4vw,40px)] font-extrabold leading-none tracking-[-0.04em]">{selected.role}</h3>
            <p className="text-[17px] text-[#CFC9BD]">
              {selected.org}
              {selected.place && `, ${selected.place}`}
            </p>
            {selected.stack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.stack.map((tech) => (
                  <span key={tech} className="rounded-full border border-white/20 px-3 py-1.5 text-[13px]">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {selected.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {selected.links.map((link) => (
                  <a
                    key={link.link}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
                  >
                    {link.text}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <ul className="flex flex-[2_1_480px] flex-col">
            {selected.points.map((point) => (
              <li key={point} className="flex gap-3.5 border-t border-white/10 py-3.5">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                <span className="text-base leading-relaxed text-[#E3DED3] sm:text-[17px]">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

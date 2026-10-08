import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle, Lightbulb } from 'lucide-react';
import { projects } from '@/data/content';
import PageBar from '@/components/layout/PageBar';
import Footer from '@/components/layout/Footer';
import { Barcode } from '@/components/ui/Barcode';
import { Lanyard, PunchSlot } from '@/components/ui/Lanyard';
import { CaseStudyVideo } from './CaseStudyVideo';

interface Props {
  params: { slug: string };
}

function getProject(slug: string) {
  return projects.find((p) => p.slug === slug && p.caseStudy);
}

function getHeroImage(project: NonNullable<ReturnType<typeof getProject>>): string {
  if (project.hasLiveDemo && project.link) {
    const params = new URLSearchParams({
      url: project.link,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
      waitForTimeout: '3000',
    });
    return `https://api.microlink.io/?${params.toString()}`;
  }
  return project.image;
}

export function generateStaticParams() {
  return projects
    .filter((p) => p.caseStudy && p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.title} | Case Study | Rutwik Patel`,
    description: project.challenge,
    openGraph: {
      title: `${project.title} | Case Study`,
      description: project.challenge,
      images: [{ url: `https://rutwik.dev${project.image}` }],
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'data science': 'DATA SCIENCE',
  'web development': 'WEB',
  ios: 'IOS APP',
  systems: 'SYSTEMS',
};

export default function ProjectCaseStudy({ params }: Props) {
  const project = getProject(params.slug);
  if (!project) notFound();

  // Titles carry a subtitle after a colon: "TalkToData: Natural Language SQL".
  const [name, ...rest] = project.title.split(':');
  const subtitle = rest.join(':').trim();
  const passNumber = String(projects.indexOf(project) + 1).padStart(2, '0');
  const caseStudies = projects.filter((p) => p.caseStudy && p.slug);
  const next = caseStudies[(caseStudies.indexOf(project) + 1) % caseStudies.length];

  const liveBadge = (project.hasLiveDemo || project.isLive) && (
    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span className="text-xs font-semibold text-emerald-700">Live</span>
    </div>
  );

  // The case study fields, in reading order, as numbered steps.
  const steps = [
    { title: 'The challenge', body: project.challenge },
    { title: 'The solution', body: project.solution },
  ].filter((s): s is { title: string; body: string } => !!s.body);

  return (
    <>
      <PageBar current="Projects" />
      <main id="main-content" className="min-h-screen bg-paper px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-16">
          {/* Title and the project pass */}
          <div className="flex flex-wrap items-center gap-14">
            <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 self-start font-mono text-[13px] tracking-[0.1em] text-taupe hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                ALL PROJECTS
              </Link>
              <span className="self-start rounded-full bg-cardinal px-3 py-1.5 font-mono text-xs tracking-[0.1em] text-white">
                {CATEGORY_LABELS[project.category] ?? project.category.toUpperCase()} · CASE STUDY
              </span>
              {/* 40px floor and break-words: one-word names like "RoomReserve"
                  are wider than a 320px phone at larger sizes. */}
              <h1 className="break-words font-display text-[clamp(40px,7vw,104px)] font-extrabold leading-[0.88] tracking-[-0.055em] text-ink">
                {name}
              </h1>
              {subtitle && (
                <p className="font-serif text-[clamp(28px,3.2vw,44px)] italic leading-[1.05] text-cardinal">{subtitle}.</p>
              )}
              <p className="max-w-[640px] text-lg leading-relaxed text-[#2C2925] sm:text-[19px]">{project.description}</p>
              <div className="flex flex-wrap gap-2.5">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[50px] items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-cardinal"
                  >
                    View live project
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <Link
                  href={`/ai?q=${encodeURIComponent(`Tell me about ${name}`)}`}
                  className="inline-flex h-[50px] items-center rounded-full border-[1.5px] border-ink px-6 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  Ask my AI about it
                </Link>
              </div>
            </div>

            {/* Fluid up to 320px, so it fits a 320px phone inside the page padding. */}
            <div className="mx-auto flex w-full max-w-[320px] flex-[0_1_320px] flex-col items-center">
              <Lanyard color="#C8102E" length={70} />
              <div className="mt-1 w-full rotate-2 overflow-hidden rounded-[26px] bg-white shadow-[0_36px_70px_rgba(16,16,18,0.18)]">
                <PunchSlot />
                <div className="mx-3.5 flex items-center justify-between rounded-[14px] bg-ink px-3.5 py-3 text-paper">
                  <span className="font-display text-lg font-extrabold">PROJECT PASS</span>
                  <span className="font-mono text-xs text-gold">No. {passNumber}</span>
                </div>
                <dl className="grid grid-cols-2 gap-4 px-5 py-5">
                  <PassFact label="STACK" value={`${project.tech.length} tools`} />
                  <PassFact label="STATUS" value={project.hasLiveDemo || project.isLive ? 'Live' : 'Built'} />
                  {project.video && <PassFact label="VIDEO" value={`${Math.round(project.video.duration)}s`} />}
                  {project.impact && <PassFact label="OUTCOMES" value={String(project.impact.length)} />}
                </dl>
                <div className="flex justify-center px-5 pb-5">
                  <Barcode value={`PASS-${passNumber}`} height={30} />
                </div>
              </div>
            </div>
          </div>

          {/* The video, or the screenshot */}
          <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-ink shadow-[0_30px_70px_rgba(16,16,18,0.22)]">
            {project.video ? (
              <CaseStudyVideo
                video={project.video}
                alt={project.imageAlt || project.title}
                trackingId={project.slug || project.title}
                badge={liveBadge}
              />
            ) : (
              <>
                <Image
                  src={getHeroImage(project)}
                  alt={project.imageAlt || project.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={(project.hasLiveDemo && !!project.link) || project.image.endsWith('.svg')}
                />
                {liveBadge}
              </>
            )}
          </div>

          {steps.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {steps.map((step, i) => (
                <section key={step.title} className="flex flex-col gap-3 rounded-3xl bg-white p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-ink font-display font-extrabold text-paper">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">{step.title}</h2>
                  <p className="text-base leading-relaxed text-[#3B3833] sm:text-[17px]">{step.body}</p>
                </section>
              ))}
            </div>
          )}

          {project.architecture && (
            <section className="flex flex-col gap-4">
              <h2 className="font-mono text-[13px] tracking-[0.12em] text-taupe">ARCHITECTURE</h2>
              <div className="rounded-3xl bg-ink p-6 font-mono text-sm leading-relaxed text-[#E3DED3] sm:p-8 sm:text-[15px]">
                {project.architecture}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-10">
            {project.impact && project.impact.length > 0 && (
              <section className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">
                <h2 className="font-mono text-[13px] tracking-[0.12em] text-taupe">IMPACT</h2>
                <ul className="flex flex-col">
                  {project.impact.map((item) => (
                    <li key={item} className="flex gap-3 border-t border-line py-3.5">
                      <CheckCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-cardinal" />
                      <span className="text-base leading-relaxed text-[#2C2925]">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {project.lessons && project.lessons.length > 0 && (
              <section className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">
                <h2 className="font-mono text-[13px] tracking-[0.12em] text-taupe">WHAT I LEARNED</h2>
                <ul className="flex flex-col">
                  {project.lessons.map((item) => (
                    <li key={item} className="flex gap-3 border-t border-line py-3.5">
                      <Lightbulb className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#B38F00]" />
                      <span className="text-base leading-relaxed text-[#2C2925]">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {next && next !== project && (
            <Link
              href={`/projects/${next.slug}`}
              className="group flex flex-wrap items-center gap-6 rounded-[28px] bg-ink px-7 py-6 text-paper"
            >
              <span className="font-mono text-[13px] tracking-[0.12em] text-gold">NEXT PASS</span>
              <span className="flex-[1_1_300px] font-display text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-0.04em]">
                {next.title.split(':')[0]}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PassFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[10px] tracking-[0.1em] text-taupe">{label}</dt>
      <dd className="font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-ink">{value}</dd>
    </div>
  );
}

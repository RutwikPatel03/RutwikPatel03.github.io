'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { VideoLightbox } from '@/components/ui/VideoLightbox';
import { Barcode } from '@/components/ui/Barcode';
import { PunchSlot } from '@/components/ui/Lanyard';
import { ArrowUpRight, BookOpen, Play } from 'lucide-react';
import { track } from '@/lib/analytics-client';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index?: number;
  /** Background behind the card, for the notches cut into the stub. */
  notchColor?: string;
}

// Generate live screenshot URL using Microlink API
function getLiveScreenshotUrl(url: string): string {
  const params = new URLSearchParams({
    url,
    screenshot: 'true',
    meta: 'false',
    embed: 'screenshot.url',
    waitForTimeout: '3000',
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

const CATEGORY_TAGS: Record<string, { label: string; className: string }> = {
  'data science': { label: 'DATA SCIENCE', className: 'bg-cardinal text-white' },
  'web development': { label: 'WEB', className: 'bg-paper text-ink' },
  ios: { label: 'IOS', className: 'bg-gold text-ink' },
  systems: { label: 'SYSTEMS', className: 'bg-ink text-paper' },
};

/** A project as an access pass: the launch video up top, a perforated stub below. */
export function ProjectCard({ project, index = 0, notchColor = '#F3F0E8' }: ProjectCardProps) {
  const { video } = project;
  const useLiveScreenshot = !video && project.hasLiveDemo && !!project.link;

  // A video's poster wins over the live screenshot; otherwise use the live
  // screenshot for projects with hasLiveDemo and a valid link.
  const imageSrc = video
    ? video.poster
    : useLiveScreenshot
      ? getLiveScreenshotUrl(project.link!)
      : project.image;

  // SVGs (e.g. the miniredis thumbnail) and live microlink screenshots bypass
  // the Next.js image optimizer — SVGs can't be re-encoded by it.
  const isUnoptimized = useLiveScreenshot || imageSrc.endsWith('.svg');

  // Not every project has a case-study slug, so the title is the fallback
  // dimension; the ingest route lowercases and slugifies whatever arrives.
  const trackingId = project.slug || project.title;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // The preview loop plays whenever the card is on screen, and pauses off it
  // so a page of cards is not decoding video nobody can see. Reduced motion
  // keeps the poster still.
  const previewRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const previewEnabled = !!video && !reduceMotion;

  useEffect(() => {
    const preview = previewRef.current;
    if (!previewEnabled || !preview || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // play() rejects if a pause lands before it resolves, which is
        // expected when a card is scrolled straight past.
        if (entry.isIntersecting) preview.play().catch(() => {});
        else preview.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      preview.pause();
    };
  }, [previewEnabled]);

  const passNumber = String(index + 1).padStart(2, '0');
  const tag = CATEGORY_TAGS[project.category] ?? { label: project.category.toUpperCase(), className: 'bg-ink text-paper' };
  // Titles carry a subtitle after a colon ("TalkToData: Natural Language SQL");
  // the pass prints the name and leaves the rest to the description.
  const [name] = project.title.split(':');

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group flex flex-col rounded-[26px] bg-white shadow-[0_14px_30px_rgba(16,16,18,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_rgba(16,16,18,0.16)]"
    >
      <PunchSlot />

      {/* The video's own 16:9 frame, so nothing in it is cropped */}
      <div className="relative mx-3.5 aspect-video overflow-hidden rounded-2xl bg-ink">
        <Image
          src={imageSrc}
          alt={project.imageAlt || `${project.title} - ${project.category} project by Rutwik Patel`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          loading="lazy"
          quality={80}
          unoptimized={isUnoptimized}
        />
        {previewEnabled && (
          <video
            ref={previewRef}
            src={video.preview}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => setPreviewPlaying(true)}
            onPause={() => setPreviewPlaying(false)}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
              previewPlaying ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
        <span className={cn('absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.08em]', tag.className)}>
          {tag.label}
        </span>
        {(project.hasLiveDemo || project.isLive) && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Live
          </span>
        )}
        {video && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Watch the ${project.title} video, ${formatDuration(video.duration)}`}
            className="absolute bottom-2.5 right-2.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Watch
            <span className="font-normal tabular-nums text-ink/70">{formatDuration(video.duration)}</span>
          </button>
        )}
      </div>

      {video && (
        <VideoLightbox
          open={lightboxOpen}
          onClose={closeLightbox}
          video={video}
          title={project.title}
          trackingId={trackingId}
        />
      )}

      {/* Project Info */}
      <div className="flex flex-1 flex-col gap-2 px-5 pb-4 pt-4">
        <h3 className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink">{name}</h3>
        <p className="line-clamp-3 text-[15px] leading-relaxed text-[#3B3833]">{project.description || project.category}</p>

        {project.tech && project.tech.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1.5">
            {project.tech.slice(0, 4).map((tech) => (
              <span key={tech} className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {project.caseStudy && project.slug && (
            <Link
              href={`/projects/${project.slug}`}
              onClick={() => track('project_open', trackingId)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition-colors hover:bg-cardinal"
            >
              <BookOpen className="h-4 w-4" />
              Case study
            </Link>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('project_external', trackingId)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-ink px-4 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              View
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* The tear-off stub */}
      <div className="relative flex items-center justify-between gap-3 border-t-2 border-dashed border-[#CFC7B6] px-5 py-3.5">
        <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={{ backgroundColor: notchColor }} />
        <span aria-hidden="true" className="absolute -right-3 -top-3 h-6 w-6 rounded-full" style={{ backgroundColor: notchColor }} />
        <span className="font-mono text-xs tracking-[0.1em] text-taupe">PASS No. {passNumber}</span>
        <Barcode value={`PASS-${passNumber}`} />
      </div>
    </motion.div>
  );
}

export default ProjectCard;

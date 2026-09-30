'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VideoLightbox } from '@/components/ui/VideoLightbox';
import { Eye, BookOpen, Play } from 'lucide-react';
import { track } from '@/lib/analytics-client';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index?: number;
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

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 backdrop-blur-sm"
    >
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden">
        {(project.hasLiveDemo || project.isLive) && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-500">Live</span>
          </div>
        )}
        <Image
          src={imageSrc}
          alt={project.imageAlt || `${project.title} - ${project.category} project by Rutwik Patel`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-105 ${
              previewPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('project_external', trackingId)}
            >
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4" />
                View
              </Button>
            </a>
          )}
          {project.caseStudy && project.slug && (
            <Link
              href={`/projects/${project.slug}`}
              onClick={() => track('project_open', trackingId)}
            >
              <Button size="sm" variant="secondary">
                <BookOpen className="w-4 h-4" />
                Case Study
              </Button>
            </Link>
          )}
        </div>
        {video && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Watch the ${project.title} video, ${formatDuration(video.duration)}`}
            className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-lg shadow-black/30 ring-1 ring-black/5 transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch
            <span className="font-normal text-neutral-500 tabular-nums">
              {formatDuration(video.duration)}
            </span>
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
      <div className="p-3 sm:p-4">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground group-hover:text-blue-500 transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {project.description || project.category}
        </p>

        {/* Tech Stack */}
        {project.tech && project.tech.length > 0 && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            {project.tech.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectCard;


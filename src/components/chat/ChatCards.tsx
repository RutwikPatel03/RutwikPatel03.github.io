'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { Check, Copy, Download, FileText, Play } from 'lucide-react';
import { VideoLightbox } from '@/components/ui/VideoLightbox';
import { siteConfig, socialLinks } from '@/constants/site';
import { projectId } from '@/lib/chat/cards';
import type { GitHubActivity } from '@/lib/chat/protocol';
import type { PostMeta } from '@/lib/blog';
import { timeAgo } from '@/lib/utils';
import { track } from '@/lib/analytics-client';
import type { Experience, Project } from '@/types';

// The rich cards the assistant places in its answers. They are drawn as boxes
// in the terminal session: monospace, hairline borders, one accent color.

const ACCENT = 'text-[#C8102E]';

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:/.test(href);
  const className = 'underline-offset-2 transition-colors hover:text-[#C8102E] hover:underline';
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children} ↗
    </a>
  ) : (
    <Link href={href} className={className}>
      → {children}
    </Link>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded bg-accent px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {item}
        </span>
      ))}
    </div>
  );
}

function linkLabel(url: string): string {
  if (url.includes('apps.apple.com')) return 'App Store';
  if (url.includes('github.com')) return 'code';
  if (url.includes('youtube.com')) return 'demo video';
  if (url.includes('/docs')) return 'live API docs';
  return 'live site';
}

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function ProjectChatCard({ project }: { project: Project }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { video } = project;
  const id = projectId(project);

  const media = video ? (
    <button
      type="button"
      onClick={() => {
        track('chat_topic', `video:${id}`);
        setOpen(true);
      }}
      aria-label={`Play the ${project.title} video`}
      className="group relative block aspect-video w-full overflow-hidden bg-black sm:w-60 sm:shrink-0"
    >
      {reduceMotion ? (
        <Image src={video.poster} alt="" fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
      ) : (
        <video
          src={video.preview}
          poster={video.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
      <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white transition-colors group-hover:bg-[#C8102E]">
        <Play className="h-3 w-3 fill-current" /> {formatDuration(video.duration)}
      </span>
    </button>
  ) : (
    <div className="relative aspect-video w-full overflow-hidden bg-accent sm:w-60 sm:shrink-0">
      <Image
        src={project.image}
        alt={project.imageAlt ?? project.title}
        fill
        sizes="(min-width: 640px) 240px, 100vw"
        unoptimized={project.image.endsWith('.svg')}
        className="object-cover"
      />
    </div>
  );

  return (
    <Box label={`project · ${project.category}`}>
      <div className="sm:flex">
        {media}
        <div className="min-w-0 space-y-2 p-3">
          <p className="font-semibold text-foreground">{project.title}</p>
          <p className="line-clamp-3 text-[13px] text-muted-foreground">{project.description}</p>
          <Chips items={project.tech} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-foreground">
            {project.caseStudy && project.slug && (
              <ExternalLink href={`/projects/${project.slug}`}>case study</ExternalLink>
            )}
            {project.link && <ExternalLink href={project.link}>{linkLabel(project.link)}</ExternalLink>}
          </div>
        </div>
      </div>
      {video && (
        <VideoLightbox open={open} onClose={close} video={video} title={project.title} trackingId={id} />
      )}
    </Box>
  );
}

export function ExperienceChatCard({ role }: { role: Experience }) {
  const [company, place] = role.company.split(/,(.+)/);
  return (
    <Box label={`experience · ${role.period}`}>
      <div className="space-y-2 p-3">
        <p className="text-foreground">
          <span className="font-semibold">{role.title}</span>
          <span className="text-muted-foreground"> @ </span>
          <span className={ACCENT}>{company}</span>
          {place && <span className="text-[13px] text-muted-foreground"> ·{place}</span>}
        </p>
        <ul className="space-y-1 text-[13px] text-muted-foreground">
          {role.description.slice(0, 3).map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {role.stack && <Chips items={role.stack} />}
        {role.highlights && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-foreground">
            {role.highlights.map((h) => (
              <ExternalLink key={h.link} href={h.link}>
                {h.text}
              </ExternalLink>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
}

export function BlogChatCard({ post }: { post: PostMeta }) {
  const date = new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return (
    <Box label={`blog · ${date} · ${post.readTime}`}>
      <div className="space-y-2 p-3">
        <p className="font-semibold text-foreground">{post.title}</p>
        <p className="text-[13px] text-muted-foreground">{post.description}</p>
        <div className="text-[13px] text-foreground">
          <ExternalLink href={`/blog/${post.slug}`}>read the post</ExternalLink>
        </div>
      </div>
    </Box>
  );
}

export function ResumeChatCard() {
  return (
    <Box label="résumé">
      <div className="flex items-center gap-3 p-3">
        <FileText className={`h-8 w-8 shrink-0 ${ACCENT}`} strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Rutwik_Patel_Resume.pdf</p>
          <p className="text-[13px] text-muted-foreground">Software &amp; Infrastructure Engineer · USC MS CS</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('chat_topic', 'resume_open')}
            className="rounded px-2 py-1.5 text-[13px] text-foreground transition-colors hover:bg-accent hover:text-[#C8102E]"
          >
            open ↗
          </a>
          <a
            href="/resume.pdf"
            download="Rutwik_Patel_Resume.pdf"
            aria-label="Download résumé"
            onClick={() => track('chat_topic', 'resume_download')}
            className="flex items-center rounded px-2 py-1.5 text-foreground transition-colors hover:bg-accent hover:text-[#C8102E]"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    </Box>
  );
}

export function ContactChatCard() {
  const [copied, setCopied] = useState(false);
  const email = siteConfig.author.email;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the mailto link still works.
    }
  };
  const rows = [
    { key: 'email', value: email, href: `mailto:${email}` },
    { key: 'linkedin', value: socialLinks.linkedin.replace('https://www.', ''), href: socialLinks.linkedin },
    { key: 'github', value: socialLinks.github.replace('https://', ''), href: socialLinks.github },
  ];
  return (
    <Box label="contact">
      <dl className="space-y-1 p-3 text-[13px]">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-3">
            <dt className="w-16 shrink-0 text-muted-foreground">{row.key}</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <a
                href={row.href}
                target={row.key === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={() => track('chat_topic', `contact:${row.key}`)}
                className="truncate text-foreground underline-offset-2 transition-colors hover:text-[#C8102E] hover:underline"
              >
                {row.value}
              </a>
              {row.key === 'email' && (
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy email address"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </dd>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <dt className="w-16 shrink-0 text-muted-foreground">form</dt>
          <dd>
            <ExternalLink href="/#contact">message him from the site</ExternalLink>
          </dd>
        </div>
      </dl>
    </Box>
  );
}

// Four shades of the accent, from an empty day to a busy one.
const HEAT = ['bg-accent', 'bg-[#C8102E]/35', 'bg-[#C8102E]/65', 'bg-[#C8102E]'];
const heatLevel = (count: number) => (count === 0 ? 0 : count < 3 ? 1 : count < 8 ? 2 : 3);

export function GitHubChatCard({ activity }: { activity: GitHubActivity }) {
  const last30 = activity.recentDays.slice(-30).reduce((sum, n) => sum + n, 0);
  return (
    <Box label={`github · live · fetched ${timeAgo(activity.fetchedAt)}`}>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <a
              href={activity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline-offset-2 hover:text-[#C8102E] hover:underline"
            >
              github.com/{activity.login}
            </a>
            <p className="text-[13px] text-muted-foreground">
              <span className="text-foreground">{activity.totalContributions}</span> contributions in the last year ·{' '}
              <span className="text-foreground">{last30}</span> in the last 30 days
            </p>
          </div>
          <div
            className="grid grid-flow-col grid-rows-7 gap-[3px]"
            role="img"
            aria-label={`Contribution heatmap for the last ${activity.recentDays.length} days`}
          >
            {activity.recentDays.map((count, i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${HEAT[heatLevel(count)]}`} />
            ))}
          </div>
        </div>
        <ul className="space-y-2 border-t border-border pt-3 text-[13px]">
          {activity.repos.map((repo) => (
            <li key={repo.name} className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-2 hover:text-[#C8102E] hover:underline"
                >
                  {repo.name}
                </a>
                <span className="text-[11px] text-muted-foreground">
                  {[repo.language, `pushed ${timeAgo(repo.pushedAt)}`].filter(Boolean).join(' · ')}
                </span>
              </div>
              {repo.commits[0] && (
                <p className="truncate text-muted-foreground">
                  <span aria-hidden="true">⎿ </span>
                  {repo.commits[0].message}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
}

'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { findExperience, findProject } from '@/lib/chat/cards';
import { CARD_TAG, type CardKind, type GitHubActivity, type MessagePart } from '@/lib/chat/protocol';
import type { PostMeta } from '@/lib/blog';
import {
  BlogChatCard,
  ContactChatCard,
  ExperienceChatCard,
  GitHubChatCard,
  ProjectChatCard,
  ResumeChatCard,
} from './ChatCards';

// The page is styled like a terminal session; this is its one accent color.
export const ACCENT = 'text-[#C8102E]';

// Cycled while something is running, like a terminal spinner.
const SPINNER_FRAMES = ['·', '✢', '✳', '✶', '✻', '✽'];

export function useSpinner(active: boolean) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 120);
    return () => clearInterval(id);
  }, [active]);
  return SPINNER_FRAMES[frame];
}

const PROSE = `text-foreground
  [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&>*:last-child]:mb-0
  [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_li]:[list-style:inherit]
  [&_h1]:mb-2 [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold
  [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-accent [&_code]:px-1
  [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[#C8102E]`;

type Segment = { kind: 'text'; text: string } | { kind: 'card'; card: CardKind; id?: string };

/**
 * Splits a text part into markdown and card tags. A tag still streaming in
 * ("[[proj") is held back rather than flashed as raw text, and the list marker
 * or backtick a model sometimes wraps around a tag is dropped with it.
 */
function segment(text: string): Segment[] {
  const clean = text.replace(/\[\[[^\]\n]*\]?$/, '');
  const out: Segment[] = [];
  const pushText = (t: string) => {
    const tidy = t
      .replace(/(^|\n)[ \t]*(?:[-*+]|\d+\.)[ \t]*`?$/, '$1')
      .replace(/^`/, '')
      .replace(/`$/, '');
    if (/[a-z0-9]/i.test(tidy)) out.push({ kind: 'text', text: tidy });
  };
  let last = 0;
  for (const match of clean.matchAll(CARD_TAG)) {
    pushText(clean.slice(last, match.index));
    out.push({ kind: 'card', card: match[1] as CardKind, id: match[2] });
    last = (match.index ?? 0) + match[0].length;
  }
  pushText(clean.slice(last));
  return out;
}

/** The message as plain text, tags removed, for copying and for history. */
export function plainText(parts: MessagePart[]): string {
  return parts
    .filter((p): p is Extract<MessagePart, { kind: 'text' }> => p.kind === 'text')
    .map((p) => p.text)
    .join('\n\n')
    .replace(CARD_TAG, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface CardContext {
  posts: PostMeta[];
  github?: GitHubActivity;
}

function renderCard(card: CardKind, id: string | undefined, { posts, github }: CardContext): ReactNode {
  switch (card) {
    case 'project': {
      const project = id && findProject(id);
      return project ? <ProjectChatCard project={project} /> : null;
    }
    case 'experience': {
      const role = id && findExperience(id);
      return role ? <ExperienceChatCard role={role} /> : null;
    }
    case 'blog': {
      const post = posts.find((p) => p.slug === id);
      return post ? <BlogChatCard post={post} /> : null;
    }
    case 'resume':
      return <ResumeChatCard />;
    case 'contact':
      return <ContactChatCard />;
    case 'github':
      return github ? <GitHubChatCard activity={github} /> : null;
  }
}

function ToolLine({ part }: { part: Extract<MessagePart, { kind: 'tool' }> }) {
  const spinner = useSpinner(part.status === 'running');
  const dot =
    part.status === 'running' ? (
      <span className={`inline-block w-[1ch] ${ACCENT}`}>{spinner}</span>
    ) : (
      <span className={part.status === 'done' ? 'text-emerald-500' : 'text-red-500'}>●</span>
    );
  return (
    <div className="flex gap-2">
      <span className="select-none" aria-hidden="true">
        {dot}
      </span>
      <div className="min-w-0">
        <span className="font-semibold text-foreground">{part.label}</span>
        {part.summary && (
          <p className="text-muted-foreground">
            <span className="select-none" aria-hidden="true">
              ⎿{'  '}
            </span>
            {part.summary}
          </p>
        )}
      </div>
    </div>
  );
}

interface AssistantMessageProps extends CardContext {
  parts: MessagePart[];
}

export function AssistantMessage({ parts, posts, github }: AssistantMessageProps) {
  // Each card shows once per answer, however many times the model tags it.
  const seen = new Set<string>();
  const context = { posts, github };

  const blocks = parts.map((part, i) => {
    if (part.kind === 'tool') return <ToolLine key={part.id || i} part={part} />;

    const segments = segment(part.text);
    if (segments.length === 0) return null;
    return (
      <div key={i} className="flex gap-2">
        <span className={`select-none ${ACCENT}`} aria-hidden="true">
          ●
        </span>
        <div className="min-w-0 flex-1">
          {segments.map((s, j) => {
            if (s.kind === 'text') {
              return (
                <div key={j} className={`${PROSE} [&+&]:mt-3`}>
                  <ReactMarkdown>{s.text}</ReactMarkdown>
                </div>
              );
            }
            const key = `${s.card}:${s.id ?? ''}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return <Fragment key={j}>{renderCard(s.card, s.id, context)}</Fragment>;
          })}
        </div>
      </div>
    );
  });

  // Live GitHub data always gets its card, even if the model forgot the tag.
  const githubFallback = github && !seen.has('github:') && (
    <div className="pl-[calc(1ch+0.5rem)]">
      <GitHubChatCard activity={github} />
    </div>
  );

  return (
    <div className="space-y-3">
      {blocks}
      {githubFallback}
    </div>
  );
}

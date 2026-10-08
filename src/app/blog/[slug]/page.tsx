import type { Metadata } from 'next';
import type { ComponentProps, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import PageBar from '@/components/layout/PageBar';
import Footer from '@/components/layout/Footer';
import { Lanyard, PunchSlot } from '@/components/ui/Lanyard';
import { siteConfig } from '@/constants';
import rehypePrettyCode from 'rehype-pretty-code';
import type { Options } from 'rehype-pretty-code';

interface Props {
  params: { slug: string };
}

const rehypePrettyCodeOptions: Options = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: true,
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} | Rutwik Patel`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase();
}

// ===========================================
// Table of contents
// ===========================================

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** The post's ## headings, skipping any inside fenced code blocks. */
function headingsOf(markdown: string): { text: string; id: string }[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  return Array.from(withoutCode.matchAll(/^## (.+)$/gm), (m) => {
    const text = m[1].replace(/[`*_]/g, '').trim();
    return { text, id: slugify(text) };
  });
}

/** Plain text of an MDX heading's children, for its anchor id. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

const mdxComponents = {
  h2: ({ children, ...props }: ComponentProps<'h2'>) => (
    <h2 id={slugify(textOf(children))} className="scroll-mt-24" {...props}>
      {children}
    </h2>
  ),
};

export default function BlogPost({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const headings = headingsOf(post.content);
  const [lead, ...restOfTitle] = post.title.split(':');

  return (
    <>
      <PageBar current="Blog" />
      <main id="main-content" className="min-h-screen bg-paper px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-[1240px]">
          <Link
            href="/blog"
            className="group mb-6 inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-taupe hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            ALL POSTS
          </Link>

          {/* Post header */}
          <header className="mb-10 flex flex-col gap-5">
            <h1 className="max-w-[1000px] font-display text-[clamp(40px,5.6vw,84px)] font-extrabold leading-[0.92] tracking-[-0.05em] text-ink">
              {restOfTitle.length ? (
                <>
                  {lead}:{' '}
                  <span className="font-serif font-normal italic tracking-[-0.02em] text-cardinal">{restOfTitle.join(':').trim()}</span>
                </>
              ) : (
                post.title
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.08em] text-taupe">
              <span>{formatDate(post.date)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime.toUpperCase()}</span>
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-ink">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="flex flex-wrap items-start gap-12">
            {headings.length > 0 && (
              <nav aria-label="On this page" className="hidden flex-[0_0_220px] flex-col gap-0.5 lg:sticky lg:top-6 lg:flex">
                <span className="pb-2.5 font-mono text-xs tracking-[0.12em] text-taupe">ON THIS PAGE</span>
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="rounded-[10px] px-3 py-2.5 text-[15px] text-[#3B3833] transition-colors hover:bg-ink hover:text-paper"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            )}

            {/* MDX Content */}
            {/* overflow-wrap:anywhere lets long bare URLs in a post break
                instead of running off a narrow phone. */}
            <article className="prose prose-neutral min-w-0 max-w-[720px] flex-[999_1_560px] text-[#24221F] [overflow-wrap:anywhere]
              prose-p:text-[19px] prose-p:leading-[1.7] prose-li:text-[18px]
              prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-[-0.03em] prose-headings:text-ink
              prose-h2:text-[34px] prose-h2:leading-[1.05]
              prose-a:text-cardinal prose-a:no-underline hover:prose-a:underline
              prose-strong:text-ink
              [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:bg-paper-deep [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:before:content-none [&_:not(pre)>code]:after:content-none
              [&_pre]:rounded-[18px] [&_pre]:border [&_pre]:border-line [&_pre]:overflow-x-auto [&_pre]:text-sm
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
                  },
                }}
              />
            </article>

            {/* Author badge */}
            <aside className="flex flex-[0_0_250px] flex-col gap-4 lg:sticky lg:top-6">
              <div className="flex flex-col items-center">
                <Lanyard color="#C8102E" length={44} />
                <div className="mt-1 w-[230px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_40px_rgba(16,16,18,0.12)]">
                  <PunchSlot className="h-5" />
                  <div className="mx-3 rounded-[10px] bg-ink px-2.5 py-2 font-mono text-[11px] tracking-[0.12em] text-paper">WRITTEN BY</div>
                  <div className="flex items-center gap-3 p-3.5">
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px]">
                      <Image src="/myimg/me.jpg" alt="" fill sizes="56px" className="object-cover object-[center_25%]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-display text-lg font-extrabold text-ink">{siteConfig.name}</span>
                      <span className="text-[13px] text-taupe">Software &amp; Infra Engineer</span>
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/ai?q=${encodeURIComponent(`Tell me about your post "${post.title}"`)}`}
                className="flex flex-col gap-1.5 rounded-[18px] bg-ink p-[18px] text-paper"
              >
                <span className="font-mono text-[11px] tracking-[0.12em] text-gold">ASK ABOUT THIS POST</span>
                <span className="text-base leading-snug">My AI has read it, and the rest of my work.</span>
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

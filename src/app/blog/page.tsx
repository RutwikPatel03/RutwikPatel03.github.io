import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import BlogCard from '@/components/ui/BlogCard';
import PageBar from '@/components/layout/PageBar';
import Footer from '@/components/layout/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { publications } from '@/data/content';

export const metadata: Metadata = {
  title: 'Blog | Rutwik Patel',
  description: 'Technical writing on AI, full-stack engineering, and software systems by Rutwik Patel.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const ieeeCount = publications.filter((p) => p.publisher === 'IEEE').length;

  return (
    <>
      <PageBar current="Blog" />
      <main id="main-content" className="min-h-screen bg-paper-deep px-4 pb-24 pt-10 sm:px-6">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8">
          <SectionHeader
            as="h1"
            eyebrow="Home / Blog"
            title="Field"
            accent="notes."
            subtitle="Write-ups of what I built, what broke and what I'd do differently."
            className="mb-2"
          />

          {posts.length === 0 ? (
            <p className="text-taupe">No posts yet. Check back soon.</p>
          ) : (
            posts.map((post, i) => <BlogCard key={post.slug} post={post} featured={i === 0} />)
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-2 border-dashed border-[#A39B8C] px-6 py-5">
            <span className="text-[17px] text-ink">
              Looking for the peer-reviewed versions? {publications.length} papers, {ieeeCount} in IEEE.
            </span>
            <Link href="/#publications" className="inline-flex items-center gap-2 font-semibold text-cardinal">
              See the press passes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

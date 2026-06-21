import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import BlogCard from '@/components/ui/BlogCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Rutwik Patel',
  description: 'Technical writing on AI, full-stack engineering, and software systems by Rutwik Patel.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main id="main-content" className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portfolio
        </Link>

        <div className="mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Writing
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Thoughts on building AI products, full-stack systems, and software engineering.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet — check back soon.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PostMeta } from '@/lib/blog';

interface BlogCardProps {
  post: PostMeta;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-border bg-muted/30 p-6 hover:border-blue-500/50 hover:bg-accent/50 transition-all duration-200"
    >
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(post.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {post.readTime}
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-blue-500 transition-colors mb-2 leading-snug">
        {post.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {post.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

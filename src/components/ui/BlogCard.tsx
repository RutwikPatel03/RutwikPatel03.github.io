import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PostMeta } from '@/lib/blog';

interface BlogCardProps {
  post: PostMeta;
  /** The newest post: black card, cardinal date stub. */
  featured?: boolean;
}

function dateParts(dateStr: string) {
  // Front matter dates are YYYY-MM-DD; read them as calendar dates, not UTC
  // midnight, so the day does not slip back in western time zones.
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    day: date.getDate(),
    monthYear: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
  };
}

/** A post as a boarding pass: the date on a tear-off stub, the post beside it. */
export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const { day, monthYear } = dateParts(post.date);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-wrap overflow-hidden rounded-[30px] transition-transform duration-300 hover:-translate-y-1',
        featured ? 'bg-ink text-paper shadow-[0_30px_60px_rgba(16,16,18,0.22)]' : 'bg-white text-ink shadow-[0_18px_40px_rgba(16,16,18,0.08)]'
      )}
    >
      <span
        className={cn(
          'flex flex-[0_0_200px] flex-col justify-between gap-5 p-7 max-sm:flex-[1_1_100%] max-sm:flex-row max-sm:items-end',
          featured ? 'bg-cardinal text-white' : 'bg-gold text-ink'
        )}
      >
        <span className={cn('font-mono text-xs tracking-[0.14em]', featured ? 'text-[#FFE6A3]' : 'text-[#3A3200]')}>
          {featured ? 'LATEST' : 'POST'}
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-[72px] font-extrabold leading-[0.85] tracking-[-0.06em] max-sm:text-5xl">{day}</span>
          <span className="font-mono text-sm tracking-[0.1em]">{monthYear}</span>
        </span>
      </span>
      <span
        className={cn(
          'flex min-w-0 flex-[1_1_480px] flex-col gap-4 border-dashed p-7 sm:border-l-2 sm:p-9',
          featured ? 'border-white/30' : 'border-[#CFC7B6]'
        )}
      >
        <span className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'rounded-full px-3 py-1 text-[13px]',
                featured ? 'border border-white/30' : 'bg-paper'
              )}
            >
              {tag}
            </span>
          ))}
        </span>
        <span className="font-display text-[clamp(28px,3.4vw,46px)] font-extrabold leading-none tracking-[-0.04em]">
          {post.title}
        </span>
        <span className={cn('max-w-[720px] text-lg leading-relaxed', featured ? 'text-[#CFC9BD]' : 'text-[#3B3833]')}>
          {post.description}
        </span>
        <span className="mt-1 flex items-center gap-4">
          <span
            className={cn(
              'inline-flex h-12 items-center rounded-full px-5 font-semibold transition-colors',
              featured ? 'bg-gold text-ink' : 'bg-ink text-paper group-hover:bg-cardinal'
            )}
          >
            Read the post
          </span>
          <span className={cn('font-mono text-[13px] tracking-[0.08em]', featured ? 'text-[#A8A296]' : 'text-taupe')}>
            {post.readTime.toUpperCase()}
          </span>
        </span>
      </span>
    </Link>
  );
}

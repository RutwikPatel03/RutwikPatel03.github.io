'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { trackOnce } from '@/lib/analytics-client';
import type { ProjectVideo } from '@/types';

interface CaseStudyVideoProps {
  video: ProjectVideo;
  alt: string;
  trackingId: string;
  /** Laid over the poster, and dropped once the video starts so it cannot cover it. */
  badge?: ReactNode;
}

/**
 * The poster stays a plain image until asked for, so the page does not pull
 * ~3 MB of video for a reader who only came for the write-up.
 */
export function CaseStudyVideo({ video, alt, trackingId, badge }: CaseStudyVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        src={video.src}
        poster={video.poster}
        controls
        autoPlay
        playsInline
        onPlay={() => trackOnce('project_video', trackingId)}
        className="absolute inset-0 h-full w-full bg-black"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play the video (${Math.round(video.duration)} seconds)`}
      className="group absolute inset-0 h-full w-full"
    >
      <Image src={video.poster} alt={alt} fill className="object-cover" priority />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center gap-3 rounded-full bg-white pl-5 pr-6 py-3.5 text-neutral-900 shadow-2xl shadow-black/40 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
          <Play className="w-6 h-6 fill-current" />
          <span className="text-sm sm:text-base font-semibold">
            Watch the demo
            <span className="ml-2 font-normal text-neutral-500 tabular-nums">
              {Math.round(video.duration)}s
            </span>
          </span>
        </span>
      </span>
      {badge}
    </button>
  );
}

export default CaseStudyVideo;

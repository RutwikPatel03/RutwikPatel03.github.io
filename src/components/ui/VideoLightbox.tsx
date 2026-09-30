'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useSmoothScrollControls } from '@/providers/SmoothScrollProvider';
import { trackOnce } from '@/lib/analytics-client';
import type { ProjectVideo } from '@/types';

interface VideoLightboxProps {
  open: boolean;
  onClose: () => void;
  video: ProjectVideo;
  title: string;
  /** Analytics dimension, the same one the card tracks opens under. */
  trackingId: string;
}

export function VideoLightbox({ open, onClose, video, title, trackingId }: VideoLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { stop: stopScroll, start: startScroll } = useSmoothScrollControls();

  // The portal target only exists in the browser.
  useEffect(() => setMounted(true), []);

  // Same two-part lock as the mobile menu: hidden overflow stops the user,
  // pausing Lenis stops the script that scrolls on their behalf.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    root.style.overflow = 'hidden';
    stopScroll();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      root.style.overflow = previous;
      startScroll();
      opener?.focus();
    };
  }, [open, onClose, stopScroll, startScroll]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} video`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-heading text-sm sm:text-base font-semibold text-white truncate">
                {title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close video"
                className="shrink-0 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              onPlay={() => trackOnce('project_video', trackingId)}
              className="w-full aspect-video rounded-xl sm:rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default VideoLightbox;

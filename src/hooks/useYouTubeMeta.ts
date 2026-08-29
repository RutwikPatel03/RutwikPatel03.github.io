'use client';

import { useEffect, useRef, useState } from 'react';

export interface VideoMeta {
  title: string;
  author: string;
}

/**
 * Titles and channel names for a set of YouTube video ids.
 *
 * A user playlist reaches us from the player as bare ids, so without this the
 * song list is a column of 11-character gibberish. Each id is asked for once
 * per page and answered from the server's Redis cache after the first time
 * anyone anywhere has looked it up.
 */
export function useYouTubeMeta(ids: string[]) {
  const [meta, setMeta] = useState<Record<string, VideoMeta>>({});
  /** Ids already requested, so a re-render never asks for the same one twice. */
  const askedRef = useRef<Set<string>>(new Set());
  // The array identity changes on every render; its contents do not.
  const key = ids.join(',');

  useEffect(() => {
    const wanted = ids.filter((id) => id && !askedRef.current.has(id));
    if (wanted.length === 0) return;
    wanted.forEach((id) => askedRef.current.add(id));

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/youtube-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: wanted }),
        });
        const data = (await res.json()) as { success?: boolean; meta?: Record<string, VideoMeta> };
        if (!cancelled && data.success && data.meta) {
          setMeta((current) => ({ ...current, ...data.meta }));
        }
      } catch {
        // Titles are a nicety. The songs still play under their ids.
      }
    })();

    return () => {
      cancelled = true;
    };
    // `key` stands in for the contents of `ids`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return meta;
}

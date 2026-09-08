'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

interface Theme {
  shade: string;
  sand: string;
  accent: string;
}

export interface TrackAction {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onSelect: () => void;
  /** Renders in the warning colour, for the one action that takes something away. */
  danger?: boolean;
}

const MENU_WIDTH = 212;
/** Roughly one row, used only to decide whether the menu opens up or down. */
const ROW_HEIGHT = 36;
const EDGE = 8;

/**
 * The ⋮ beside a song, and the menu it opens.
 *
 * Rendered into a portal rather than into the row. Both lists that use this
 * scroll inside `overflow-y-auto`, which clips an absolutely positioned child,
 * and both sit under overlays with their own stacking contexts — so a menu
 * living in the row is either cut in half or painted underneath the sheet.
 * Fixed coordinates measured off the button avoid both.
 */
export function TrackMenu({
  label,
  theme,
  actions,
  className,
}: {
  label: string;
  theme: Theme;
  actions: TrackAction[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const place = useCallback(() => {
    const box = buttonRef.current?.getBoundingClientRect();
    if (!box) return;
    const height = actions.length * ROW_HEIGHT + 12;
    // Open downwards unless the bottom of the screen is closer than the menu
    // is tall — which is most of the time on a phone, where these rows sit
    // near the fold.
    const room = window.innerHeight - box.bottom;
    const top = room > height + EDGE ? box.bottom + 6 : Math.max(EDGE, box.top - height - 6);
    const left = Math.min(
      Math.max(EDGE, box.right - MENU_WIDTH),
      Math.max(EDGE, window.innerWidth - MENU_WIDTH - EDGE)
    );
    setPos({ top, left });
  }, [actions.length]);

  // Measured before paint, so the menu never shows in the wrong place first.
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Otherwise Esc closes the drawer underneath at the same time.
      e.stopPropagation();
      setOpen(false);
    };

    /**
     * Follow the row instead of closing.
     *
     * Closing on any scroll seemed reasonable and was wrong on a phone: a tap
     * lands while the list is still settling from the flick that got you
     * there, so the menu opened and vanished in the same gesture. Re-anchoring
     * keeps it attached to its row; it only closes once that row is gone.
     */
    const onScroll = () => {
      const box = buttonRef.current?.getBoundingClientRect();
      if (!box || box.bottom < 0 || box.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      place();
    };

    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', close);
    // Capture: what scrolls is the list, not the window.
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          // The whole row plays the song; the ⋮ must not.
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={`More options for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        // A bordered pill rather than a bare glyph. On these dark stations a
        // plain dimmed icon sits quieter than the artist line beside it and
        // reads as decoration, so it has to look like something to press.
        className={`ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8 ${
          className ?? ''
        }`}
        style={
          open
            ? {
                borderColor: theme.accent,
                backgroundColor: `${theme.accent}26`,
                color: theme.accent,
              }
            : {
                borderColor: `${theme.sand}33`,
                backgroundColor: `${theme.sand}0f`,
                color: theme.sand,
              }
        }
      >
        <MoreVertical className="h-[1.05rem] w-[1.05rem]" />
      </button>

      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[90]"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            <div
              role="menu"
              aria-label={label}
              onClick={(e) => e.stopPropagation()}
              className="fixed overflow-hidden rounded-xl border py-1.5 shadow-2xl"
              style={{
                top: pos.top,
                left: pos.left,
                width: MENU_WIDTH,
                backgroundColor: theme.shade,
                borderColor: `${theme.sand}26`,
                color: theme.sand,
                boxShadow: '0 20px 50px #000b',
              }}
            >
              {actions.map((action) => (
                <button
                  key={action.label}
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onSelect();
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[0.8rem] transition-colors hover:bg-white/10"
                  style={action.danger ? { color: '#ff8080' } : undefined}
                >
                  <action.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

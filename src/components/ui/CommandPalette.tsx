'use client';

import { useCallback } from 'react';
import { Command } from 'cmdk';
import { useCommandPalette } from '@/providers/CommandPaletteProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useScrollToSection } from '@/hooks';
import { siteConfig, socialLinks, externalLinks } from '@/constants';
import {
  User, Briefcase, FolderOpen, MessageSquare, BookOpen, Mail,
  Moon, Sun, Download, Bot, Github, Linkedin, Copy, X,
} from 'lucide-react';

type CommandItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  hint?: string;
};

type CommandGroup = {
  heading: string;
  items: CommandItem[];
};

export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const { theme, toggleTheme } = useTheme();
  const scrollToSection = useScrollToSection();

  const go = useCallback((href: string) => {
    setOpen(false);
    setTimeout(() => scrollToSection(href), 50);
  }, [setOpen, scrollToSection]);

  const groups: CommandGroup[] = [
    {
      heading: 'Navigate',
      items: [
        { id: 'about', label: 'About Me', icon: User, onSelect: () => go('#about') },
        { id: 'experience', label: 'Experience', icon: Briefcase, onSelect: () => go('#experience') },
        { id: 'projects', label: 'Projects', icon: FolderOpen, onSelect: () => go('#projects') },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, onSelect: () => go('#testimonials') },
        { id: 'publications', label: 'Publications', icon: BookOpen, onSelect: () => go('#publications') },
        { id: 'contact', label: 'Contact', icon: Mail, onSelect: () => go('#contact') },
      ],
    },
    {
      heading: 'Actions',
      items: [
        {
          id: 'theme',
          label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          icon: theme === 'dark' ? Sun : Moon,
          onSelect: () => { toggleTheme(); setOpen(false); },
        },
        {
          id: 'copy-email',
          label: 'Copy Email Address',
          icon: Copy,
          hint: siteConfig.author.email,
          onSelect: () => {
            navigator.clipboard.writeText(siteConfig.author.email);
            setOpen(false);
          },
        },
        {
          id: 'resume',
          label: 'Download Resume',
          icon: Download,
          onSelect: () => { window.open(externalLinks.resume, '_blank'); setOpen(false); },
        },
        {
          id: 'ai',
          label: 'Ask AI about Rutwik',
          icon: Bot,
          onSelect: () => { window.location.href = externalLinks.aiChat; setOpen(false); },
        },
      ],
    },
    {
      heading: 'Links',
      items: [
        {
          id: 'linkedin',
          label: 'LinkedIn',
          icon: Linkedin,
          onSelect: () => { window.open(socialLinks.linkedin, '_blank'); setOpen(false); },
        },
        {
          id: 'github',
          label: 'GitHub',
          icon: Github,
          onSelect: () => { window.open(socialLinks.github, '_blank'); setOpen(false); },
        },
      ],
    },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full" loop>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <span className="text-muted-foreground text-sm">⌘</span>
            <Command.Input
              autoFocus
              placeholder="Search commands..."
              className="flex-1 py-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {groups.map((group) => (
              <Command.Group
                key={group.heading}
                heading={group.heading}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={item.onSelect}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground cursor-pointer select-none
                               data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground
                               hover:bg-accent transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.hint && (
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
            <span className="ml-auto"><kbd className="font-mono">⌘K</kbd> toggle</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { projects } from '@/data/content';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'web development', label: 'Web' },
  { id: 'ios', label: 'iOS' },
  { id: 'data science', label: 'Data science' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

/** Every project as a pass, filterable by category. */
export default function ProjectsIndex() {
  const [filter, setFilter] = useState<FilterId>('all');
  // Pass numbers stay fixed to a project's place in the full list, so a
  // filtered view does not renumber them.
  const numbered = projects.map((project, index) => ({ project, index }));
  const shown = filter === 'all' ? numbered : numbered.filter(({ project }) => project.category === filter);

  return (
    <>
      <div role="group" aria-label="Filter projects" className="mb-9 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.id === 'all' ? projects.length : projects.filter((p) => p.category === f.id).length;
          if (count === 0) return null;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-12 items-center gap-2.5 rounded-full border-[1.5px] border-ink pl-[18px] pr-2 text-base font-medium transition-colors',
                active ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-deep'
              )}
            >
              {f.label}
              <span
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-mono text-[13px] text-ink',
                  active ? 'bg-gold' : 'bg-paper-deep'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {shown.map(({ project, index }) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </div>
    </>
  );
}

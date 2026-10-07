'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/data/content';
import { SectionHeader, ProjectCard } from '@/components/ui';

export default function Projects() {
  return (
    <section id="projects" className="bg-paper px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader eyebrow="03 Projects" title="Access" accent="passes." className="mb-0" />
          <Link
            href="/projects"
            className="mb-2 inline-flex h-[50px] items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-colors hover:bg-cardinal"
          >
            Filter all {projects.length}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

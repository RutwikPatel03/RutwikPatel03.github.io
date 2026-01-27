'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 backdrop-blur-sm"
    >
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden">
        {project.hasLiveDemo && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-500">Live</span>
          </div>
        )}
        <Image
          src={project.image}
          alt={project.imageAlt || `${project.title} - ${project.category} project by Rutwik Patel`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          quality={80}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4" />
                View
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-foreground group-hover:text-blue-500 transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {project.description || project.category}
        </p>

        {/* Tech Stack */}
        {project.tech && project.tech.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectCard;


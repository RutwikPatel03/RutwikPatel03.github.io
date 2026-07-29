import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, CheckCircle, Lightbulb, Zap, Code2 } from 'lucide-react';
import { projects } from '@/data/content';
import { Badge } from '@/components/ui/Badge';

interface Props {
  params: { slug: string };
}

function getProject(slug: string) {
  return projects.find((p) => p.slug === slug && p.caseStudy);
}

function getHeroImage(project: NonNullable<ReturnType<typeof getProject>>): string {
  if (project.hasLiveDemo && project.link) {
    const params = new URLSearchParams({
      url: project.link,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
      waitForTimeout: '3000',
    });
    return `https://api.microlink.io/?${params.toString()}`;
  }
  return project.image;
}

export function generateStaticParams() {
  return projects
    .filter((p) => p.caseStudy && p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study | Rutwik Patel`,
    description: project.challenge,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.challenge,
      images: [{ url: `https://rutwik.dev${project.image}` }],
    },
  };
}

export default function ProjectCaseStudy({ params }: Props) {
  const project = getProject(params.slug);
  if (!project) notFound();

  return (
    <main id="main-content" className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>

        {/* Hero */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border mb-8">
          <Image
            src={getHeroImage(project)}
            alt={project.imageAlt || project.title}
            fill
            className="object-cover"
            priority
            unoptimized={(project.hasLiveDemo && !!project.link) || project.image.endsWith('.svg')}
          />
          {(project.hasLiveDemo || project.isLive) && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          )}
        </div>

        {/* Title + tech + live link */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {project.tech.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Live Project
            </a>
          )}
        </div>

        <div className="space-y-12">
          {/* Challenge */}
          {project.challenge && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Zap className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">The Challenge</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-11">{project.challenge}</p>
            </section>
          )}

          {/* Solution */}
          {project.solution && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Code2 className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">The Solution</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-11">{project.solution}</p>
            </section>
          )}

          {/* Architecture */}
          {project.architecture && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Code2 className="w-4 h-4 text-purple-500" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">Architecture</h2>
              </div>
              <div className="pl-11 p-4 rounded-xl border border-border bg-muted/30 font-mono text-sm text-muted-foreground leading-relaxed">
                {project.architecture}
              </div>
            </section>
          )}

          {/* Impact */}
          {project.impact && project.impact.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">Impact</h2>
              </div>
              <ul className="space-y-3 pl-11">
                {project.impact.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Lessons */}
          {project.lessons && project.lessons.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-foreground">What I Learned</h2>
              </div>
              <ul className="space-y-3 pl-11">
                {project.lessons.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Projects
          </Link>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

import { education, experience, projects, thisSite } from '@/data/content';
import type { SkillItem } from '@/types';

// Turns "I know PostgreSQL" into "here is where I used PostgreSQL", by matching
// a skill against the `tech` of every visible project and the `stack` of every
// role and degree. Hidden projects are commented out of `projects`, so they drop out of
// the proof too, and restoring one brings its skills back with it.

export interface Proof {
  kind: 'project' | 'role' | 'education';
  title: string;
  subtitle: string;
  href: string;
  external: boolean;
  image?: string;
}

const normalize = (value: string) => value.trim().toLowerCase();

function matcher(skill: SkillItem) {
  const names = new Set([skill.name, ...(skill.aliases ?? [])].map(normalize));
  return (tags: readonly string[] = []) => tags.some((tag) => names.has(normalize(tag)));
}

// "TalkToData - Natural Language SQL" reads better as a title plus a tagline.
function splitTitle(title: string): [string, string | undefined] {
  const [head, ...rest] = title.split(' - ');
  return [head, rest.length ? rest.join(' - ') : undefined];
}

export function proofFor(skill: SkillItem): Proof[] {
  const uses = matcher(skill);

  const roles: Proof[] = experience
    .filter((role) => uses(role.stack))
    .map((role) => ({
      kind: 'role',
      title: role.company.split(',')[0],
      subtitle: `${role.title} · ${role.period}`,
      href: '#experience',
      external: false,
    }));

  const work: Proof[] = projects
    .filter((project) => uses(project.tech))
    .map((project) => {
      const [title, tagline] = splitTitle(project.title);
      const caseStudy = project.caseStudy && project.slug;
      return {
        kind: 'project',
        title,
        subtitle: tagline ?? project.description,
        href: caseStudy ? `/projects/${project.slug}` : project.link ?? '#projects',
        external: !caseStudy && !!project.link,
        image: project.image,
      };
    });

  if (uses(thisSite.tech)) {
    work.push({
      kind: 'project',
      title: thisSite.title,
      subtitle: thisSite.subtitle,
      href: thisSite.link,
      external: true,
    });
  }

  // Coursework is the weakest evidence, so it is listed last.
  const study: Proof[] = education
    .filter((degree) => uses(degree.stack))
    .map((degree) => ({
      kind: 'education',
      title: degree.school.split(',')[0],
      subtitle: `${degree.degree.split('|')[0].trim()} · coursework`,
      href: '#experience',
      external: false,
    }));

  return [...roles, ...work, ...study];
}

import { experience, projects } from '@/data/content';
import type { Experience, Project } from '@/types';

// Card ids are derived from the site data, so the ids the model is told about
// and the ids the UI resolves can never disagree. A project hidden from the
// site drops out of both at once.

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Case-study slug when there is one, else the title before any subtitle. */
export const projectId = (project: Project) =>
  project.slug ?? slugify(project.title.split(':')[0]);

/** Company plus start year, since USC Marshall appears twice. */
export const experienceId = (role: Experience) => {
  const company = slugify(role.company.split(',')[0].replace(/ School of Business/, ''));
  const year = role.period.match(/\d{4}/)?.[0] ?? '';
  return `${company}-${year}`;
};

export const findProject = (id: string) => projects.find((p) => projectId(p) === id);

export const findExperience = (id: string) => experience.find((e) => experienceId(e) === id);

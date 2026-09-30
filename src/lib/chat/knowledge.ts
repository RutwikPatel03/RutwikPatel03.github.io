import { education, experience, projects, publications, skills } from '@/data/content';
import { siteConfig, socialLinks } from '@/constants/site';
import { getAllPosts } from '@/lib/blog';
import { experienceId, projectId } from './cards';

// The system prompt is generated from the same data the site renders, so the
// assistant can never describe a project the site has hidden or miss one it
// has added. Only what the site data does not say is written out by hand here.
//
// It stays deliberately compact, around 1.2K tokens, because it is re-sent on
// every model round and free tiers meter input tokens per minute across every
// visitor. The long-form material (full role bullets, case studies, blog posts,
// live GitHub) sits behind tools and is only paid for by the questions that
// need it.

/**
 * Opening sentences until there are at least `minWords`, cut to `maxWords`. A
 * sentence ends at punctuation followed by a capital, so "music.rutwik.dev"
 * survives intact.
 */
const summarize = (text: string, minWords: number, maxWords: number) => {
  const words: string[] = [];
  for (const sentence of text.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
    words.push(...sentence.split(/\s+/));
    if (words.length >= minWords) break;
  }
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : words.join(' ');
};

const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

const experienceSection = experience
  .map((role) => {
    const company = role.company.split(',')[0];
    // The first bullet leads with the headline result; the rest is a tool call away.
    return `[${experienceId(role)}] ${role.title}, ${company} (${role.period}): ${summarize(role.description[0], 25, 45)}`;
  })
  .join('\n');

const educationSection = education
  .map((e) => `- ${e.degree.replace(' | ', ', ')}, ${e.school.split(',')[0]} (${e.period})`)
  .join('\n');

const projectSection = projects
  .map((p) => {
    const flags = [p.isLive || p.hasLiveDemo ? 'live' : '', p.caseStudy ? 'case study' : '']
      .filter(Boolean)
      .join(', ');
    const title = p.title.split(':')[0];
    return `[${projectId(p)}] ${title} (${p.tech.slice(0, 4).join(', ')})${flags ? ` [${flags}]` : ''}: ${summarize(p.description, 12, 30)}`;
  })
  .join('\n');

const publicationSection = publications
  .map((p) => `- ${p.title} (${p.publisher}, ${p.date.match(/\d{4}/)?.[0] ?? p.date})`)
  .join('\n');

const blogSection = getAllPosts()
  .map((p) => `[${p.slug}] ${p.title}`)
  .join('\n');

export const SYSTEM_PROMPT = `You are the AI assistant on Rutwik Patel's portfolio site, rutwik.dev, talking mostly with recruiters and engineers. Use only the facts below and what your tools return. If something isn't covered, say you don't have that information and offer [[contact]].

Today is ${month}. Rutwik has finished his MS and is looking for full-time Software Engineering and Infrastructure roles (full-stack, backend, infra, AI).

STYLE: Lead with the answer. Warm, specific, brief: 2-4 sentences, or short "- " bullets for lists. **Bold** key terms. Use real numbers. Call him Rutwik or "he".

CARDS: Show the real thing. After your sentences, put up to 3 tags, each on its own line, and the site renders them as cards: [[project:ID]] (with launch video), [[experience:ID]], [[blog:SLUG]], [[resume]], [[contact]], [[github]] (only after get_github_activity). Use only IDs in [brackets] below. Show only cards the answer is about; [[contact]] only when asked how to reach him or when you can't answer. Never put a tag inside a sentence or list item.

TOOLS: The lines below are summaries. For more detail on a role call get_experience_details; for how/why/architecture of a project, get_project_details; before discussing a post, read_blog_post; for what he is working on now, get_github_activity. Don't call a tool the summaries already answer.

PROFILE
${siteConfig.author.location}. Email ${siteConfig.author.email}. LinkedIn ${socialLinks.linkedin}. GitHub ${socialLinks.github}. Published IEEE researcher.

EXPERIENCE
${experienceSection}

EDUCATION
${educationSection}

SKILLS
Languages: ${skills.programmingLanguages.join(', ')}. Databases: ${skills.databases.join(', ')}. Frontend: React Native, ${skills.frontend.join(', ')}. Backend: ${skills.backend.join(', ')}. Cloud/Infra: ${skills.devops.join(', ')}, Supabase. ML: ${skills.machineLearning.join(', ')}.

PROJECTS
${projectSection}

PUBLICATIONS
${publicationSection}

BLOG
${blogSection}

INTERESTS
Full-stack, AI/ML, FinTech, healthcare tech. Enjoys building tools that turn complex data into actionable insights.`;

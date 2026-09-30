import { getPostBySlug } from '@/lib/blog';
import { getGitHubActivity } from '@/lib/github-activity';
import { timeAgo } from '@/lib/utils';
import { findExperience, findProject } from './cards';
import type { GitHubActivity, ToolName } from './protocol';

// The assistant's tools. Each one fetches long-form material the system prompt
// leaves out, and returns two things: compact text for the model, which is
// re-sent on the next round and so is capped hard, and a one-line summary for
// the transcript.

/** ~600 tokens. Enough for a case study or the body of a post. */
const MAX_RESULT_CHARS = 2400;

const clip = (text: string) =>
  text.length > MAX_RESULT_CHARS ? `${text.slice(0, MAX_RESULT_CHARS)}…[truncated]` : text;

// OpenAI-compatible tool schemas, which is the format Groq accepts.
export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_experience_details',
      description: 'Everything he did in one role: all bullets, stack, and links.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Role id from EXPERIENCE' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project_details',
      description: "A project's case study: challenge, solution, architecture, impact, lessons.",
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Project id from PROJECTS' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_blog_post',
      description: 'The text of one of his blog posts.',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'Post slug from BLOG' } },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_github_activity',
      description: 'His live GitHub: contributions this year and the repos and commits he pushed most recently.',
      parameters: { type: 'object', properties: {} },
    },
  },
] as const;

export const TOOL_NAMES: ReadonlySet<string> = new Set(TOOL_DEFINITIONS.map((t) => t.function.name));

export interface ToolResult {
  /** What the model reads. */
  content: string;
  /** What the transcript shows under the call. */
  summary: string;
  ok: boolean;
  /** Present when the call fetched live GitHub data for the card. */
  github?: GitHubActivity;
}

/** The call as the transcript shows it, short and terminal-flavoured. */
export function toolLabel(name: ToolName, args: Record<string, unknown>): string {
  switch (name) {
    case 'get_experience_details':
      return `role(${String(args.id ?? '')})`;
    case 'get_project_details':
      return `case_study(${String(args.id ?? '')})`;
    case 'read_blog_post':
      return `read_post(${String(args.slug ?? '')})`;
    case 'get_github_activity':
      return 'github.activity()';
  }
}

function experienceDetails(id: string): ToolResult {
  const role = findExperience(id);
  if (!role) return { ok: false, content: `No role with id "${id}".`, summary: 'Not found' };
  const lines = [
    `# ${role.title}, ${role.company} (${role.period})`,
    ...role.description.map((d) => `- ${d}`),
    role.stack ? `Stack: ${role.stack.join(', ')}` : '',
    ...(role.highlights ?? []).map((h) => `Shipped: ${h.text} (${h.link})`),
  ];
  return {
    ok: true,
    content: clip(lines.filter(Boolean).join('\n')),
    summary: `Read ${role.description.length} highlights from ${role.company.split(',')[0]}`,
  };
}

function projectDetails(id: string): ToolResult {
  const project = findProject(id);
  if (!project) {
    return { ok: false, content: `No project with id "${id}".`, summary: 'Not found' };
  }
  if (!project.caseStudy) {
    return {
      ok: true,
      content: `${project.title} has no case study. Everything known is in PROJECTS.`,
      summary: 'No case study, using the project summary',
    };
  }
  const sections = [
    `# ${project.title}`,
    `Challenge: ${project.challenge}`,
    `Solution: ${project.solution}`,
    `Architecture: ${project.architecture}`,
    `Impact:\n${(project.impact ?? []).map((i) => `- ${i}`).join('\n')}`,
    `Lessons:\n${(project.lessons ?? []).map((l) => `- ${l}`).join('\n')}`,
  ];
  return {
    ok: true,
    content: clip(sections.join('\n\n')),
    summary: `Read the ${project.title.split(':')[0]} case study`,
  };
}

function blogPost(slug: string): ToolResult {
  const post = getPostBySlug(slug);
  if (!post) return { ok: false, content: `No blog post with slug "${slug}".`, summary: 'Not found' };
  return {
    ok: true,
    content: clip(`# ${post.title}\n\n${post.content.trim()}`),
    summary: `Read "${post.title}" (${post.readTime})`,
  };
}

async function githubActivity(): Promise<ToolResult> {
  try {
    const activity = await getGitHubActivity();
    const last30 = activity.recentDays.slice(-30).reduce((sum, n) => sum + n, 0);
    const repos = activity.repos
      .map((r) => {
        const commits = r.commits.map((c) => `"${c.message}"`).join(', ');
        return `- ${r.name} (${r.language ?? 'n/a'}, pushed ${timeAgo(r.pushedAt)})${commits ? `: ${commits}` : ''}`;
      })
      .join('\n');
    return {
      ok: true,
      github: activity,
      content: `Live GitHub for ${activity.login}, fetched just now:\n- ${activity.totalContributions} contributions in the last year, ${last30} in the last 30 days\nMost recently pushed:\n${repos}`,
      summary: `${activity.totalContributions} contributions this year · ${activity.repos.length} recent repos`,
    };
  } catch (error) {
    console.error('GitHub activity tool failed:', error);
    return {
      ok: false,
      content: 'GitHub is unreachable right now. Say so briefly and link his profile.',
      summary: 'GitHub unreachable',
    };
  }
}

export async function runTool(name: ToolName, args: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case 'get_experience_details':
      return experienceDetails(String(args.id ?? ''));
    case 'get_project_details':
      return projectDetails(String(args.id ?? ''));
    case 'read_blog_post':
      return blogPost(String(args.slug ?? ''));
    case 'get_github_activity':
      return githubActivity();
  }
}

// The wire format between /api/chat and the chat UI, shared by both sides.
//
// The route streams newline-delimited JSON, one ChatEvent per line. Text
// arrives in small deltas as the model writes it; tool events bracket each
// tool call so the UI can show the call running and then what it returned.
// Nothing in here may import server-only code: the client bundles this file.

export type ToolName =
  | 'get_experience_details'
  | 'get_project_details'
  | 'read_blog_post'
  | 'get_github_activity';

export interface GitHubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  commits: { message: string; date: string }[];
}

export interface GitHubActivity {
  login: string;
  url: string;
  totalContributions: number;
  /** Daily contribution counts for the last 12 weeks, oldest first. */
  recentDays: number[];
  repos: GitHubRepo[];
  fetchedAt: string;
}

export type ChatEvent =
  | { type: 'text'; delta: string }
  | {
      type: 'tool';
      id: string;
      name: ToolName;
      /** The call as the transcript shows it, e.g. `case_study(restore-wellness)`. */
      label: string;
      status: 'running' | 'done' | 'error';
      /** One line on what came back, once the call has finished. */
      summary?: string;
    }
  | { type: 'github'; activity: GitHubActivity }
  | { type: 'error'; message: string }
  | { type: 'done'; cached?: boolean };

/** A piece of an assistant turn, in the order it happened. */
export type MessagePart =
  | { kind: 'text'; text: string }
  | {
      kind: 'tool';
      id: string;
      name: ToolName;
      label: string;
      status: 'running' | 'done' | 'error';
      summary?: string;
    };

// Cards are placed by the model with a tag on its own line, like
// [[project:restore-wellness]]. A tag costs a handful of tokens where a tool
// call costs a second model round, which matters on an 8K tokens/minute budget.
export const CARD_KINDS = ['project', 'experience', 'blog', 'resume', 'contact', 'github'] as const;
export type CardKind = (typeof CARD_KINDS)[number];

export const CARD_TAG = /\[\[(project|experience|blog|resume|contact|github)(?::([a-z0-9-]+))?\]\]/g;

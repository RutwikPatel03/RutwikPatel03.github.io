import { experience, projects } from '@/data/content';
import { experienceId, projectId } from './chat/cards';

// Canned prompts shared by the chat UI and the answer cache.
//
// These live here rather than in the component because the server needs to know
// which questions are self-contained. A visitor clicking "Where did he study?"
// three messages deep is asking something that does not depend on the preceding
// conversation, so its answer is safe to serve from cache even mid-thread.
// Free-typed follow-ups ("tell me more", "what about that one?") are not.

/** Topic chips shown on the empty state. Icons stay in the component. */
export const INITIAL_SUGGESTION_TOPICS = [
  'Work experience',
  'Technical skills',
  'Projects',
  'Education',
] as const;

export const buildTopicQuestion = (topic: string) =>
  `Tell me about Rutwik's ${topic.toLowerCase()}`;

/** Slash commands for INITIAL_SUGGESTION_TOPICS, in the same order. */
export const TOPIC_COMMANDS = ['/experience', '/skills', '/projects', '/education'] as const;

/** Commands the /ai page offers beyond the four the homepage hero shares. */
export const EXTRA_COMMANDS = [
  {
    command: '/github',
    label: "What he's building right now, live from GitHub",
    question: 'What has Rutwik been building lately on GitHub?',
  },
  { command: '/blog', label: 'What he writes about', question: 'What has Rutwik written on his blog?' },
  { command: '/resume', label: 'His résumé', question: "Can I see Rutwik's résumé?" },
  { command: '/contact', label: 'Get in touch', question: 'How can I contact Rutwik?' },
] as const;

/** Turns a typed command into its canned question; anything else passes through. */
export const resolveTopicCommand = (text: string): string => {
  const typed = text.trim().toLowerCase();
  const index = (TOPIC_COMMANDS as readonly string[]).indexOf(typed);
  if (index !== -1) return buildTopicQuestion(INITIAL_SUGGESTION_TOPICS[index]);
  return EXTRA_COMMANDS.find((c) => c.command === typed)?.question ?? text;
};

/** Suggestion chips offered after each answer. */
export const FOLLOW_UP_QUESTIONS = [
  'What did he do at Sigma Computing?',
  'Tell me about his work at World Salon',
  'What are his key achievements?',
  'What frontend frameworks does he know?',
  'Tell me about his backend experience',
  'Has he worked with cloud services?',
  'Tell me about the RAG system he built',
  // TEMPORARILY HIDDEN (2026-08-29): miniredis is off the public site for now.
  // 'What is miniredis and how fast is it?',
  'Does he have infrastructure or systems experience?',
  'What was his cataract detection project?',
  'Has he shipped anything to the App Store?',
  'Has he built any full-stack applications?',
  'Where did he study?',
  'Tell me about his research publications',
  'What programming languages does he know?',
  'How can I contact him?',
  'What AI/ML projects has he worked on?',
  'Tell me about his iOS development experience',
  'What has he been building lately?',
  'How does Restore Wellness prevent double-booking?',
  'Walk me through the TalkToData architecture',
  'What did he learn building cataract detection with XAI?',
] as const;

// Follow-ups that pick up where an answer left off, one per card it showed.
// A case study invites "how does it work"; a role invites the rest of what he
// did there. Each names its subject, so it stands on its own and is cacheable.

const shortTitle = (title: string) => title.split(':')[0].replace(/\s*\(.*\)/, '').trim();
const shortCompany = (company: string) => company.split(',')[0].replace(/ School of Business$/, '');

const CARD_FOLLOW_UPS: ReadonlyMap<string, string> = new Map([
  ...projects
    .filter((p) => p.caseStudy)
    .map((p) => [`project:${projectId(p)}`, `How does ${shortTitle(p.title)} work under the hood?`] as const),
  ...experience.map((e) => {
    // USC Marshall appears twice, so a repeated company gets the start year.
    const company = shortCompany(e.company);
    const repeated = experience.filter((o) => shortCompany(o.company) === company).length > 1;
    const year = e.period.match(/\d{4}/)?.[0];
    const where = repeated && year ? `${company} in ${year}` : company;
    return [`experience:${experienceId(e)}`, `What else did he do at ${where}?`] as const;
  }),
]);

/** The name a question about a card would use, lowercased, e.g. "sigma computing". */
export const cardSubjectName = (card: string): string | undefined => {
  const [kind, id] = card.split(':');
  if (kind === 'project') {
    const project = projects.find((p) => projectId(p) === id);
    return project && shortTitle(project.title).toLowerCase();
  }
  if (kind === 'experience') {
    const role = experience.find((e) => experienceId(e) === id);
    return role && shortCompany(role.company).toLowerCase();
  }
  return undefined;
};

/** Follow-ups for the cards an answer showed, given as `kind:id`. */
export const followUpsForCards = (cards: string[]): string[] =>
  cards.map((card) => CARD_FOLLOW_UPS.get(card)).filter((q): q is string => !!q);

/**
 * Strips casing and punctuation so "What's his experience?" and
 * "whats his experience" resolve to the same cache entry.
 */
export function normalizeQuestion(question: string): string {
  return question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Every prompt the UI can generate on its own, normalized for lookup. */
export const CONTEXT_FREE_QUESTIONS: ReadonlySet<string> = new Set([
  ...INITIAL_SUGGESTION_TOPICS.map((t) => normalizeQuestion(buildTopicQuestion(t))),
  ...EXTRA_COMMANDS.map((c) => normalizeQuestion(c.question)),
  ...FOLLOW_UP_QUESTIONS.map(normalizeQuestion),
  ...Array.from(CARD_FOLLOW_UPS.values(), normalizeQuestion),
]);

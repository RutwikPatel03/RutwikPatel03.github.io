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

/** Suggestion chips offered after each answer. */
export const FOLLOW_UP_QUESTIONS = [
  'What did he do at Sigma Computing?',
  'Tell me about his work at World Salon',
  'What are his key achievements?',
  'What frontend frameworks does he know?',
  'Tell me about his backend experience',
  'Has he worked with cloud services?',
  'Tell me about the RAG system he built',
  'What is miniredis and how fast is it?',
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
] as const;

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
  ...FOLLOW_UP_QUESTIONS.map(normalizeQuestion),
]);

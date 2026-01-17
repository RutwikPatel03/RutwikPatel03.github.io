export type PageType = 'About' | 'ExperienceEducation' | 'Portfolio' | 'Publication' | 'Blog' | 'Contact';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Project {
  title: string;
  category: string;
  image: string;
  link?: string;
}

export interface TimelineItem {
  company: string;
  title: string;
  period: string;
  description: string[];
}

export interface Publication {
  title: string;
  image: string;
  link: string;
  category: string;
  date: string;
  publisher: string;
  publishedIn: string;
  isbn: string;
}

export interface BlogPost {
  title: string;
  image: string;
  link: string;
  category?: string;
  date?: string;
  description: string;
}


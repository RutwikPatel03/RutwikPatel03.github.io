// ===========================================
// Navigation & Page Types
// ===========================================

export type PageType = 'About' | 'ExperienceEducation' | 'Portfolio' | 'Publication' | 'Blog' | 'Contact';

// ===========================================
// Chat Types
// ===========================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ===========================================
// Content Types
// ===========================================

export interface Skills {
  programmingLanguages: readonly string[];
  databases: readonly string[];
  frontend: readonly string[];
  backend: readonly string[];
  devops: readonly string[];
  machineLearning: readonly string[];
}

export interface ExperienceHighlight {
  text: string;
  link: string;
}

export interface Experience {
  company: string;
  title: string;
  period: string;
  description: string[];
  highlights?: ExperienceHighlight[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  description: string;
}

export interface Project {
  title: string;
  category: string;
  image: string;
  imageAlt?: string;
  link?: string;
  description: string;
  tech: string[];
  hasLiveDemo?: boolean;
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

// Legacy alias for backward compatibility
export type TimelineItem = Experience;


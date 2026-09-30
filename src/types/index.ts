import type React from 'react';

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

export interface SkillItem {
  name: string;
  // Other spellings of this skill in a project's `tech` or a role's `stack`,
  // e.g. 'Tailwind' for 'Tailwind CSS'. Matching is case-insensitive.
  aliases?: string[];
}

export interface SkillCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  skills: SkillItem[];
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
  // Skills this role used, named as in skillCategories (or an alias). The About
  // section cites the role as proof, so only list what was really used there.
  stack?: string[];
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
  // Shows the "Live" badge without swapping the thumbnail for a microlink
  // screenshot. Used for App Store / native apps whose image is a custom graphic.
  isLive?: boolean;
  // Case study fields
  slug?: string;
  caseStudy?: boolean;
  challenge?: string;
  solution?: string;
  architecture?: string;
  impact?: string[];
  lessons?: string[];
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

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  relationship: string;
  date: string;
  text: string;
  image?: string;
}

// Legacy alias for backward compatibility
export type TimelineItem = Experience;


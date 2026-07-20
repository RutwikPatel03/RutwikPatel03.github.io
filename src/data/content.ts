import { Code2, Database, Cloud, Brain, Layers, Globe } from 'lucide-react';
import type {
  Skills,
  Experience,
  Education,
  Project,
  Publication,
  BlogPost,
  Testimonial,
  SkillCategory,
} from '@/types';

// Re-export types for backward compatibility
export type { Skills, Experience, Education, Project, Publication, BlogPost, Testimonial, SkillCategory } from '@/types';

// ===========================================
// Data
// ===========================================

export const skills: Skills = {
  programmingLanguages: ['Python', 'TypeScript', 'JavaScript', 'Go', 'Swift'],
  databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'Chroma', 'Redis'],
  frontend: ['React', 'Angular', 'Next.js', 'Redux', 'Zustand', 'Tailwind', 'Material UI', 'Jest', 'Cypress'],
  backend: ['Node.js', 'Express.js', 'Django REST', 'Flask', 'FastAPI', 'REST APIs', 'Microservices'],
  devops: ['AWS', 'GCP', 'Docker', 'CI/CD', 'Terraform'],
  machineLearning: ['PyTorch', 'TensorFlow', 'LangChain', 'RAG Systems', 'OpenAI Embeddings'],
} as const;

export const skillsWithLevels: SkillCategory[] = [
  {
    title: 'Programming Languages',
    icon: Code2,
    color: 'text-blue-500',
    skills: [
      { name: 'Python', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'JavaScript', level: 88 },
      { name: 'Go', level: 70 },
      { name: 'Swift', level: 65 },
    ],
  },
  {
    title: 'Frontend',
    icon: Globe,
    color: 'text-purple-500',
    skills: [
      { name: 'React', level: 92 },
      { name: 'Next.js', level: 90 },
      { name: 'Angular', level: 75 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'Redux / Zustand', level: 78 },
    ],
  },
  {
    title: 'Backend',
    icon: Layers,
    color: 'text-green-500',
    skills: [
      { name: 'Node.js / Express', level: 85 },
      { name: 'FastAPI', level: 82 },
      { name: 'Django REST', level: 78 },
      { name: 'REST APIs', level: 92 },
      { name: 'Microservices', level: 75 },
    ],
  },
  {
    title: 'Databases',
    icon: Database,
    color: 'text-orange-500',
    skills: [
      { name: 'PostgreSQL', level: 85 },
      { name: 'MongoDB', level: 82 },
      { name: 'MySQL', level: 80 },
      { name: 'Redis', level: 72 },
      { name: 'Chroma (Vector DB)', level: 70 },
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: Cloud,
    color: 'text-cyan-500',
    skills: [
      { name: 'AWS', level: 80 },
      { name: 'Docker', level: 80 },
      { name: 'GCP', level: 75 },
      { name: 'CI/CD', level: 75 },
      { name: 'Terraform', level: 65 },
    ],
  },
  {
    title: 'AI / ML',
    icon: Brain,
    color: 'text-pink-500',
    skills: [
      { name: 'LangChain / RAG', level: 88 },
      { name: 'PyTorch', level: 80 },
      { name: 'OpenAI Embeddings', level: 82 },
      { name: 'TensorFlow', level: 75 },
      { name: 'Groq / LLM APIs', level: 85 },
    ],
  },
];

export const experience: Experience[] = [
  {
    company: 'Sigma Computing, New York, NY',
    title: 'Software Engineer Intern',
    period: 'Sept 2025 - Dec 2025',
    description: [
      'Built Conditional Formatting for Containers from scratch, enabling dynamic styling based on formula conditions - now used by 60+ enterprise organizations.',
      'Implemented Custom Page Headers feature end-to-end, allowing users to add branded headers to workbooks for professional reporting.',
      'Shipped 4 production features by owning full development lifecycle from design collaboration through deployment and post-release monitoring.',
      'Expanded test coverage and caught regressions early, improving production stability and reducing post-release issues.',
    ],
    highlights: [
      { text: 'Conditional Formatting for Containers', link: 'https://help.sigmacomputing.com/docs/use-containers-to-organize-workbook-layouts' },
      { text: 'Custom Page Headers', link: 'https://help.sigmacomputing.com/docs/add-custom-page-headers-to-a-workbook' },
    ],
  },
  {
    company: 'World Salon, Los Angeles, CA',
    title: 'Software Engineer Intern',
    period: 'Jul 2024 - Aug 2025',
    description: [
      'Solved slow speaker sourcing by automating data extraction and outreach workflows, processing 39,000+ profiles e2e.',
      'Improved team efficiency through AI-driven speaker profiling and personalized outreach, enabling scalable sourcing.',
      'Addressed performance and scalability bottlenecks by modularizing core, payment services improving latency by 20%.',
      'Spearheaded Event creation workflow using MERN stack with JWT authentication, role-based access control.',
    ],
    highlights: [
      { text: 'Main Website', link: 'https://www.world-salon.com' },
      { text: 'B2B Platform', link: 'https://b2b.world-salon.com' },
    ],
  },
  {
    company: 'USC Marshall School of Business, Los Angeles, CA',
    title: 'Research Assistant',
    period: 'Feb 2024 - May 2025',
    description: [
      'Implemented automated web scraper using Selenium to collect 10 years of SP1500 sustainability reports (15K+ PDFs).',
      'Engineered RAG system with 10K+ vector embeddings and semantic search across 500GB+ energy transition data.',
      'Executed multi-threaded PDF pipeline with OCR attaining 30% faster extraction vs. prior single-threaded workflow.',
      'Created PostgreSQL database indexing 2M+ data points with React UI for researchers accessing processed reports.',
      'Automated Orbis database scraper for 1.8M+ companies using dynamic threading, reducing manual workload by 90%.',
    ],
  },
  {
    company: 'Smart Consultant, Mumbai, India',
    title: 'Software Development Engineer Intern',
    period: 'May 2022 - Jul 2022',
    description: [
      'Designed inventory management system for small retail businesses with Django REST API and PostgreSQL database.',
      'Delivered dashboard analytics showing sales trends, profit margins, and automated ABC analysis for 5000+ SKUs.',
      'Deployed on AWS EC2 achieving 200ms response times with S3/CloudFront CDN, supporting 15+ concurrent clients.',
    ],
  },
];

export const education: Education[] = [
  {
    school: 'University of Southern California',
    degree: 'Masters of Science in Computer Science | GPA: 3.81/4.0',
    period: 'August 2023 - May 2025',
    description: 'Developed advanced technical expertise in algorithms, database systems, and web technologies while enhancing problem-solving skills and innovation.',
  },
  {
    school: 'University of Mumbai, Mumbai, India',
    degree: 'Bachelor of Technology in Information Technology | GPA: 3.8/4.0',
    period: 'August 2019 - May 2023',
    description: 'Gained a solid foundation in operating systems, machine learning, software engineering, and computer networks.',
  },
];

export const projects: Project[] = [
  // Live deployed projects first
  /* Netflix Clone — commented out
  {
    title: 'Netflix Clone',
    category: 'web development',
    image: '/myimg/Project_Netflix_Clone.png',
    imageAlt: 'Netflix Clone - Full-stack streaming platform UI clone with user authentication and movie browsing built with Next.js, TypeScript, Tailwind CSS, and Supabase by Rutwik Patel',
    link: 'https://netflix.rutwik.dev',
    description: 'Full-stack Netflix clone with user authentication, movie browsing, My List, and trailer playback using TMDB API.',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase'],
    hasLiveDemo: true,
    slug: 'netflix-clone',
    caseStudy: true,
    challenge: 'Building a feature-complete streaming platform requires solving real engineering problems: secure auth flows, paginated API calls to a third-party movie database, persistent user lists, and a pixel-close UI—without cutting corners on any of them.',
    solution: 'Built a full-stack Next.js 14 app using the App Router. Supabase handles both auth (magic link + OAuth) and the Postgres database for My List persistence. The TMDB API powers all movie data with server-side fetch calls to avoid exposing API keys. Trailer playback embeds YouTube iframes via a React portal to prevent layout shifts.',
    architecture: 'Next.js 14 App Router (server + client components) → Supabase Auth for user sessions → Supabase Postgres for My List → TMDB REST API (server-side) → YouTube embed for trailers. Deployed on Vercel with edge caching for TMDB responses.',
    impact: [
      'Deployed at netflix.rutwik.dev — accessible to any user, no sign-up wall',
      'TMDB integration surfaces 500K+ movies and shows with real ratings and metadata',
      'My List syncs across browser tabs instantly via Supabase real-time subscriptions',
      'Auth flows support both magic link and Google OAuth — no password storage',
      'Server components fetch TMDB data at build/request time, keeping API keys off the client',
    ],
    lessons: [
      'Supabase real-time subscriptions made cross-tab My List sync a zero-effort win — no custom WebSocket needed',
      'TMDB rate limiting required batching requests with Promise.allSettled for genre pages, reducing API calls by 60%',
      'Using Next.js route groups kept auth pages visually separate without duplicating layout code',
    ],
  },
  */
  {
    title: 'Airbnb-Lite - Hotel Booking API',
    category: 'web development',
    image: '/myimg/Project_Airbnb-Lite.png',
    imageAlt: 'Airbnb-Lite API - Full-featured hotel booking backend with FastAPI, PostgreSQL, JWT auth, room management, and payment integration by Rutwik Patel',
    link: 'https://airbnblite-api.onrender.com/api/v1/docs',
    description: 'Full-featured hotel booking backend API with user authentication, hotel/room management, booking flow, and mock payment integration.',
    tech: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'JWT'],
    hasLiveDemo: true,
    slug: 'airbnb-lite',
    caseStudy: true,
    challenge: 'A hotel booking system has tricky consistency requirements: two users booking the same room at the same time must not both succeed. Building this correctly — with proper auth, availability windows, and payment flow — from scratch is a systems design exercise that surfaces real database and API design decisions.',
    solution: 'Designed a layered FastAPI backend: route handlers → service layer → SQLAlchemy repository. Booking conflicts are prevented using database-level row locking (SELECT FOR UPDATE) inside a transaction, ensuring only one booking can claim a room for overlapping dates. JWT tokens (access + refresh) handle auth. Auto-generated OpenAPI docs via FastAPI serve as live documentation.',
    architecture: 'FastAPI routers → Pydantic schemas for validation → Service layer for business logic → SQLAlchemy ORM with PostgreSQL → Alembic for migrations. JWT auth middleware. Row-level locking for booking conflict prevention. Mock Stripe integration in the payment service layer.',
    impact: [
      'Live Swagger UI at airbnblite-api.onrender.com/api/v1/docs — fully interactive documentation',
      'Zero double-booking bugs: row-level locking prevents race conditions under concurrent load',
      'Full booking lifecycle: search → reserve → pay → cancel with status transitions',
      'JWT refresh token rotation implemented correctly — no silent token reuse attacks',
      'Alembic migrations make schema changes safe and reversible across environments',
    ],
    lessons: [
      'SELECT FOR UPDATE inside a transaction is the correct primitive for booking conflict prevention — optimistic locking would work too but adds retry complexity',
      'FastAPI\'s dependency injection made adding auth middleware to specific routes clean without wrapping every handler',
      'Pydantic v2\'s model_validator enabled cross-field validation (check-out must be after check-in) at the schema layer, keeping the service layer clean',
    ],
  },
  {
    title: 'TalkToData - Natural Language SQL',
    category: 'web development',
    image: '/myimg/Project_TalkToData.png',
    imageAlt: 'TalkToData - AI-powered SQL query interface converting natural language to SQL, supporting PostgreSQL, MySQL, SQLite, SQL Server, and MongoDB by Rutwik Patel',
    link: 'https://talktodata.vercel.app/',
    description: 'AI-powered SQL query interface that converts plain English to SQL. Supports PostgreSQL, MySQL, SQLite, SQL Server, and MongoDB with AI-driven query explanations and error fixing.',
    tech: ['Next.js', 'TypeScript', 'Groq AI', 'Tailwind'],
    hasLiveDemo: true,
    slug: 'talk-to-data',
    caseStudy: true,
    challenge: 'Non-technical users need database insights but SQL is a barrier. Existing solutions are expensive (Text-to-SQL SaaS tools) or require complex setup. The goal was a lightweight, self-service tool that handles the 5 most common database dialects with zero configuration.',
    solution: 'Built a Next.js app with a Next.js API route that sends a carefully engineered prompt to Groq\'s llama-3.1 model. The prompt includes the user\'s schema context, target dialect, and few-shot SQL examples to constrain output to valid queries. A second AI call generates a plain-English explanation of the query. A third call handles error recovery — if the SQL fails syntax validation, it feeds the error back to the model for correction.',
    architecture: 'Next.js 14 frontend → /api/sql route → Groq API (llama-3.1-8b-instant) with a 3-call pipeline: (1) NL→SQL generation with schema context, (2) SQL explanation, (3) error recovery if validation fails. Dialect-specific prompt templates for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB.',
    impact: [
      'Supports 5 database dialects — users switch between them with one click',
      'Sub-200ms SQL generation via Groq\'s inference speed (fastest LLM API for this use case)',
      'Error recovery loop fixes invalid SQL automatically — users rarely see raw errors',
      'Deployed on Vercel with zero cold-start latency for the frontend',
      'Schema-aware prompting means column names and table relationships are respected in output',
    ],
    lessons: [
      'Few-shot examples in the prompt reduced SQL syntax errors by ~70% vs. zero-shot — the model needs to see the dialect in action',
      'Groq\'s llama-3.1-8b-instant was 3–5× faster than GPT-3.5 for this task and free-tier friendly, making it the right choice for a public demo',
      'Streaming the AI response character-by-character felt much faster to users than waiting for the full SQL, even though total latency was the same',
    ],
  },
  {
    title: 'Stock Insight Application (Web)',
    category: 'web development',
    image: '/myimg/Project_Stock_Web.png',
    imageAlt: 'Stock Insight Web Application - Real-time stock tracking dashboard built with Angular, Express, MongoDB deployed on Google Cloud Platform by Rutwik Patel',
    link: 'https://rutwikpatelassignment3.wl.r.appspot.com/',
    description: 'Full-stack stock trading platform with real-time data from Finnhub and Polygon APIs. Features portfolio management, watchlists, and interactive charts with responsive Angular Material design.',
    tech: ['Angular', 'Express', 'MongoDB', 'GCP'],
    hasLiveDemo: true,
  },
  {
    title: 'World Salon Website',
    category: 'web development',
    image: '/myimg/world-salon.jpg',
    imageAlt: 'World Salon Platform - Speaker sourcing and event management website built with React, Node.js, MongoDB, AWS by Rutwik Patel',
    link: 'https://www.world-salon.com',
    description: 'Built during my internship at World Salon. Event creation platform with JWT authentication, role-based access control, and integrated payment workflows.',
    tech: ['React', 'Node.js', 'MongoDB', 'AWS'],
    hasLiveDemo: true,
  },
  // Other projects
  {
    title: 'Cataract Detection with Explainable AI (XAI)',
    category: 'data science',
    image: '/myimg/Project_Cataract.png',
    imageAlt: 'Cataract Detection AI System - CNN-based medical imaging with GradCAM explainability achieving 97% accuracy, IEEE published research by Rutwik Patel',
    link: 'https://cataractdetectionwithxai.streamlit.app/',
    description: 'Led team of 3 to develop CNN-based cataract detection system achieving 97% accuracy with explainable AI integration. Integrated GradCAM for visualizing model decisions.',
    tech: ['Streamlit', 'Python', 'CNN', 'GradCAM'],
    hasLiveDemo: true,
  },
  {
    title: 'Fake News Detection',
    category: 'data science',
    image: '/myimg/Project_FakeNews.png',
    imageAlt: 'Fake News Detection System - Deep learning NLP model using BERT and RoBERTa achieving 93% accuracy on 115K+ articles by Rutwik Patel',
    description: 'Developed and benchmarked multiple deep learning architectures achieving 93% accuracy. Achieved 94% precision, recall, and F1-score on WELFake and Kaggle datasets with 115K+ articles.',
    tech: ['Python', 'CNN-LSTM', 'BERT', 'RoBERTa'],
  },
  {
    title: 'XBook - Second Hand Book Platform',
    category: 'web development',
    image: '/myimg/Project_XBOOK.png',
    imageAlt: 'XBook Platform - Second-hand book marketplace web application for buying and selling used books by Rutwik Patel',
    link: 'https://github.com/RutwikPatel13/xbook',
    description: 'Platform for buying and selling second-hand books.',
    tech: ['Web Development'],
  },
  {
    title: 'Stock Insight Application (iOS)',
    category: 'ios',
    image: '/myimg/Project_Stock_iOS.png',
    imageAlt: 'Stock Insight iOS App - Native Swift application for real-time stock tracking and portfolio management by Rutwik Patel',
    link: 'https://www.youtube.com/watch?v=ePcyn-KFkc0',
    description: 'Complementary iOS app built in Swift replicating core web features for seamless cross-platform experience.',
    tech: ['Swift', 'iOS'],
  },
];

export const publications: Publication[] = [
  {
    title: 'Exploring the Potentials of Explainable AI for Early Cataract Detection to Foster Accessible Healthcare',
    image: '/myimg/blogs/xai1.png',
    link: 'https://jusst.org/exploring-the-potentials-of-explainable-ai-for-early-cataract-detection-to-foster-accessible-healthcare/',
    category: 'Data Science',
    date: 'September 2023',
    publisher: 'Jusst.org',
    publishedIn: 'VOLUME 25, ISSUE 9 - 2023',
    isbn: '1007-6735',
  },
  {
    title: 'XAI meets Ophthalmology: An Explainable Approach to Cataract Detection using VGG-19 and Grad-CAM',
    image: '/myimg/blogs/xai2.png',
    link: 'https://ieeexplore.ieee.org/document/10450053',
    category: 'Data Science',
    date: 'March, 2024',
    publisher: 'IEEE',
    publishedIn: '2023 IEEE Pune Section International Conference (PuneCon)',
    isbn: '979-8-3503-2420-4',
  },
  {
    title: 'Federated Learning to Preserve the Privacy of User Data',
    image: '/myimg/blogs/ieee.png',
    link: 'https://ieeexplore.ieee.org/document/10104860',
    category: 'Data Science',
    date: 'April, 2023',
    publisher: 'IEEE',
    publishedIn: '2023 Somaiya International Conference on Technology and Information Management (SICTIM)',
    isbn: '979-8-3503-3329-9',
  },
  {
    title: 'Literature Survey on virtual laboratory for secondary students',
    image: '/myimg/blogs/jusst.png',
    link: 'https://jusst.org/literature-survey-on-virtual-laboratory-for-secondary-students/',
    category: 'Tools and Technologies',
    date: 'December, 2022',
    publisher: 'Jusst.org',
    publishedIn: 'VOLUME 24, ISSUE 12 - 2022 – S.No.11',
    isbn: '1007-6735',
  },
];

export const blogPosts: BlogPost[] = [
  {
    title: 'Unmasking the Predictions: Understanding Cataract Detection through Explainable AI',
    image: '/myimg/blogs/blog_img_1.png',
    link: 'https://rutwikpatel1313.medium.com/unmasking-the-predictions-understanding-cataract-detection-through-explainable-ai-2babacfb6863',
    category: 'Data Science',
    date: 'May, 2023',
    description: 'This blog will help you understand What is Explainable AI, Importance of white-box model, When to use which XAI technique.',
  },
  {
    title: 'Coming Soon',
    image: '/myimg/blogs/comming_soon_img.jpeg',
    link: '',
    description: 'Blog upcoming topics: Federated Learning, XAI implementation, Machine Learning topics',
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Jonathan Zhang',
    title: 'Frontend Engineer',
    company: 'Sigma Computing',
    relationship: 'Jonathan was Rutwik\'s mentor',
    date: 'December 15, 2025',
    text: 'I mentored Rutwik during his internship at Sigma. Rutwik is a diligent and professional engineer who continually impressed us with his ability to move at a blistering pace without sacrificing quality. During his 12 weeks, he independently shipped a highly-requested feature to customers and onboarded to 4 other feature projects in which he made significant contributions. He incorporates feedback fast, and I would be glad to work with Rutwik again down the line.',
  },
  {
    name: 'Karen A. Green',
    title: 'Program Manager, The Business of Energy Initiative',
    company: 'USC Marshall School of Business',
    relationship: 'Karen A. managed Rutwik directly',
    date: 'November 19, 2025',
    text: 'I am pleased to recommend Rutwik. Throughout our work together, he consistently demonstrated strong analytical thinking, exceptional problem-solving abilities, and an impressive capacity to learn complex concepts quickly. He works collaboratively, communicates clearly, and approaches challenges with persistence and intellectual curiosity. I am confident that Rutwik will be a valuable asset to any team and will excel in any role that demands technical skill, creativity, and dedication.',
  },
  {
    name: 'Nancy Chen',
    title: 'Postdoctoral Fellow in Entrepreneurship',
    company: 'USC Marshall School of Business',
    relationship: 'Nancy managed Rutwik directly',
    date: 'November 19, 2024',
    text: 'I had the pleasure of working with Rutwik, and I can confidently say they are an exceptional professional. He has consistently demonstrated remarkable responsibility, always taking ownership of their tasks and delivering high-quality results. Rutwik\'s independence sets him apart—he requires minimal guidance and is always proactive in identifying and addressing challenges. He has a solution-oriented mindset, approaching problems creatively and efficiently, which has been invaluable in achieving the goals of our research. Rutwik also has impressive expertise in natural language processing, leveraging his knowledge to deliver innovative and effective solutions. His ability to combine technical skills with a results-driven approach makes him a standout contributor. I wholeheartedly recommend Rutwik to anyone looking for a dedicated, capable, and skilled team member. His professionalism and expertise will undoubtedly make him an asset to any organization.',
  },
];


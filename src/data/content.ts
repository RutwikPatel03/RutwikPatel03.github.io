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
  programmingLanguages: ['Python', 'TypeScript', 'JavaScript', 'C++', 'Go'],
  databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Chroma'],
  frontend: ['React', 'Next.js', 'Angular', 'Redux', 'Zustand', 'Tailwind', 'Jest', 'Cypress'],
  backend: ['Node.js', 'Express.js', 'Django REST', 'Flask', 'FastAPI', 'REST APIs', 'Microservices'],
  devops: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'Monitoring & Logging'],
  machineLearning: ['PyTorch', 'TensorFlow', 'LangChain', 'RAG Systems', 'OpenAI Embeddings'],
} as const;

export const skillsWithLevels: SkillCategory[] = [
  {
    title: 'Programming Languages',
    icon: Code2,
    color: 'text-blue-500',
    skills: [
      { name: 'Python', level: 92 },
      { name: 'TypeScript', level: 90 },
      { name: 'JavaScript', level: 88 },
      { name: 'C++', level: 82 },
      { name: 'Go', level: 80 },
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
      { name: 'PostgreSQL', level: 88 },
      { name: 'Redis', level: 82 },
      { name: 'MongoDB', level: 82 },
      { name: 'Chroma (Vector DB)', level: 72 },
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    icon: Cloud,
    color: 'text-cyan-500',
    skills: [
      { name: 'AWS (EC2, S3, RDS)', level: 84 },
      { name: 'Docker', level: 85 },
      { name: 'CI/CD & GitHub Actions', level: 82 },
      { name: 'Kubernetes', level: 72 },
      { name: 'Terraform', level: 70 },
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
    company: 'USC Marshall School of Business, Los Angeles, CA',
    title: 'Research Assistant',
    period: 'Jan 2026 - May 2026',
    description: [
      'Built a RAG-based semantic search and chat platform over 10K+ vector embeddings, letting researchers query 500GB+ of structured and unstructured sustainability disclosures in natural language.',
      'Developed chunking and schema-guided LLM pipelines that extract structured ESG fields from unstructured disclosures.',
      'Shipped a React dashboard and chat interface for 30+ researchers, cutting 15+ hours per week of manual review.',
      'Integrated an LLM layer grounding answers in retrieved disclosures with citations to reduce hallucination, plus a feedback loop capturing researcher ratings to refine retrieval accuracy over time.',
    ],
  },
  {
    company: 'Sigma Computing, New York, NY',
    title: 'Software Engineer Intern',
    period: 'Sept 2025 - Dec 2025',
    description: [
      'Delivered four production features end-to-end — owning implementation, testing, and deployment — including a condition-based formula visualization tool, Form v2, headers, and navigation used by 60+ enterprise organizations.',
      'Optimized rendering of large data grids with memoization and virtualization, improving dashboard responsiveness.',
      'Wrote Cypress end-to-end tests for critical workbook flows, catching regressions before they reached production.',
    ],
    highlights: [
      { text: 'Conditional Formatting for Containers', link: 'https://help.sigmacomputing.com/docs/use-containers-to-organize-workbook-layouts' },
      { text: 'Custom Page Headers', link: 'https://help.sigmacomputing.com/docs/add-custom-page-headers-to-a-workbook' },
    ],
  },
  {
    company: 'World Salon, Los Angeles, CA',
    title: 'Software Engineer',
    period: 'Jul 2024 - Aug 2025',
    description: [
      'Launched an events platform powering 130+ events for institutions, speakers, attendees, BDR, and internal teams.',
      'Engineered scraping and OpenAI-powered profiling pipelines that processed 58,000+ candidate profiles end-to-end, automating the company\'s core speaker-sourcing operation.',
      'Designed REST APIs with JWT auth and role-based access control across production services and admin routes.',
      'Refactored a monolithic backend into modular payment and event services, reducing request latency by 20%.',
      'Containerized and deployed applications on AWS using Docker, EC2, S3, and GitHub Actions CI/CD pipelines.',
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
      'Engineered fault-tolerant ETL pipelines chaining Selenium scraping, OCR, and indexing to ingest 15,000+ sustainability reports across 10 years of S&P 1500 filings into a unified research knowledge base.',
      'Modeled normalized PostgreSQL schemas with targeted indexing over 2M+ extracted data points, cutting query latency by 12% and powering fast downstream analytics, semantic retrieval, and reporting.',
      'Parallelized PDF extraction with multithreading, cutting processing time 30% over the prior sequential pipeline.',
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
  // Flagship systems project
  {
    title: 'miniredis - Redis-Compatible In-Memory Store',
    category: 'systems',
    image: '/myimg/Project_miniredis.svg',
    imageAlt: 'miniredis - A Redis-compatible in-memory store built from scratch in C++17 with a non-blocking epoll/kqueue reactor, RESP protocol, skip-list sorted sets, and 984K+ ops/sec throughput by Rutwik Patel',
    link: 'https://github.com/RutwikPatel13/miniredis',
    description: 'A Redis-compatible in-memory store written from scratch in C++17 — non-blocking epoll/kqueue reactor over the RESP protocol, hand-written skip-list sorted sets, AOF persistence, pub/sub, and replication. Reaches 984K+ ops/sec.',
    tech: ['C++17', 'epoll / kqueue', 'RESP', 'Skip List'],
    slug: 'miniredis',
    caseStudy: true,
    challenge: 'Redis makes single-threaded, event-driven networking look effortless — but reproducing it from scratch means solving the hard parts yourself: a non-blocking reactor that scales across thousands of connections, a wire protocol parser that handles partial reads, a sorted-set data structure with logarithmic operations, and durability without blocking the event loop. The goal was a from-scratch, Redis-compatible server fast enough to be benchmarked against the real thing.',
    solution: 'Built a single-threaded, non-blocking reactor in modern C++17 using epoll on Linux and kqueue on macOS behind one portable event-loop abstraction. Implemented a streaming RESP (REdis Serialization Protocol) parser that tolerates partial reads and pipelining, so any redis-cli or Redis client library can talk to it unmodified. Sorted sets are backed by a hand-written skip list giving O(log n) inserts and range queries. Throughput was pushed to 984K+ ops/sec — a 2.5x gain — by sharding locks across key space, and the whole thing is load-tested with a custom Go benchmark harness.',
    architecture: 'Client (redis-cli / any RESP client) → non-blocking epoll/kqueue reactor → streaming RESP protocol parser → command dispatch → data structures (hash table, hand-written skip list for ZSETs) → AOF persistence + pub/sub + replication. Sharded locking across the key space for throughput. Cross-platform event-loop abstraction (Linux/macOS). Go-based load-testing harness.',
    impact: [
      'Reaches 984K+ ops/sec — 2.5x higher throughput via sharded locking',
      'Wire-compatible with the RESP protocol: works with redis-cli and standard Redis clients unmodified',
      'Hand-written skip list delivers O(log n) sorted-set inserts and range queries',
      'Non-blocking epoll/kqueue reactor scales across many concurrent connections on a single thread',
      'AOF persistence, pub/sub, and replication implemented from scratch',
      'Load-tested end-to-end with a custom Go benchmark harness',
    ],
    lessons: [
      'A streaming protocol parser must treat every read as partial — buffering RESP frames across reads was the difference between "works with one client" and "works under load"',
      'Sharded locking across the key space unlocked most of the 2.5x throughput gain; a single global lock left cores idle',
      'A hand-written skip list is far simpler to reason about than a balanced tree and hits the same O(log n) bounds Redis relies on for ZSETs',
      'Abstracting epoll and kqueue behind one interface kept the core loop identical across Linux and macOS',
    ],
  },
  // Shipped product — live on the App Store
  {
    title: 'Restore Wellness — In-Home Massage Marketplace',
    category: 'ios',
    image: '/myimg/Project_RestoreWellness.jpg',
    imageAlt: 'Restore Wellness Massage - An in-home massage marketplace iOS app built with React Native, Expo, Supabase, and Stripe Connect, live on the Apple App Store, by Rutwik Patel',
    link: 'https://apps.apple.com/us/app/restore-wellness-massage/id6788890538',
    description: 'A three-sided in-home massage marketplace shipped to the App Store. Clients book a licensed therapist to their home, the therapist accepts and fulfills the session, and an admin dispatch panel runs bookings, compliance, and payouts — with Stripe Connect handling client payments and therapist payouts.',
    tech: ['React Native', 'Expo', 'Supabase', 'Stripe', 'TypeScript', 'PostgreSQL'],
    slug: 'restore-wellness',
    caseStudy: true,
    challenge: 'This isn\'t a single app — it\'s a marketplace with three roles (client, therapist, admin) sharing one codebase, plus real money moving between strangers. The hard parts stack up: a booking has to be handed to exactly one therapist even when several tap "Accept" at the same instant; a client pays the business while each therapist gets paid out to their own account; identity has to be verified for in-person safety; and the whole thing has to clear Apple review before a single user can install it.',
    solution: 'Built a React Native app on Expo Router where the same binary serves clients, therapists, and admins — the UI a user sees is gated by their Supabase auth role. Supabase Postgres with Row Level Security is the security boundary, so a client can never read another client\'s bookings even if they hit the API directly. Around 30 Deno edge functions run everything that must stay server-side: Stripe Checkout for client payments, Stripe Connect for therapist payouts and refunds, the Stripe webhook, Resend transactional email at every step, and Expo push notifications. Booking assignment uses an optimistic lock — the accept only writes if the row is still unassigned — so the first therapist to tap "Accept" wins and the rest get a clean "already taken" instead of a double-booking.',
    architecture: 'Expo Router RN app (Client / Therapist / Admin, role-gated) → Supabase Auth + Postgres with Row Level Security → ~30 Deno edge functions → Stripe (Checkout for client charges, Connect for therapist payouts, refunds, webhooks) → Resend for transactional email → Expo push notifications. Booking state machine: pending_assignment → upcoming → completed → SOAP notes + review request. Optimistic locking on accept prevents double-assignment.',
    impact: [
      'Live on the Apple App Store — passed Apple review, including required account deletion and reviewer demo accounts',
      'One React Native codebase serves three roles (client, therapist, admin) off a single Supabase auth model',
      'Stripe Connect marketplace flow: client pays the business, each therapist is paid out to their own connected account, admin issues refunds',
      'Optimistic-lock booking assignment guarantees exactly one therapist claims each request under concurrent taps',
      'Row Level Security enforces per-user data isolation at the database, not just in the UI',
      'End-to-end lifecycle automated over ~30 edge functions: matching, arrival, SOAP clinical notes, review requests, and provider compliance/onboarding',
    ],
    lessons: [
      'An optimistic lock (write only if still unassigned) was a far simpler and more reliable way to prevent double-booking than a queue or a distributed lock',
      'Apple review shapes the build: account deletion, working demo accounts, and payments in Stripe test mode all had to exist before submission — planning for them late would have cost a rejection cycle',
      'Row Level Security is worth the upfront effort — it makes the database the source of truth for authorization, so a missed client-side check can\'t leak another user\'s data',
      'Pushing every payment and email call into Supabase edge functions kept Stripe and Resend secrets off the device entirely, which the client app has no business holding',
    ],
  },
  // Live deployed projects
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
    title: 'RoomReserve - Hotel Booking API',
    category: 'web development',
    image: '/myimg/Project_Airbnb-Lite.png',
    imageAlt: 'RoomReserve API - Full-featured hotel booking backend with FastAPI, PostgreSQL, JWT auth, room management, and payment integration by Rutwik Patel',
    link: 'https://airbnblite-api.onrender.com/api/v1/docs',
    description: 'Full-featured hotel booking backend API with user authentication, hotel/room management, booking lifecycle, and mock payment integration — 20+ REST endpoints on a normalized relational schema with concurrency-safe double-booking prevention.',
    tech: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'JWT'],
    hasLiveDemo: true,
    slug: 'roomreserve',
    caseStudy: true,
    challenge: 'A hotel booking system has tricky consistency requirements: two users booking the same room at the same time must not both succeed. Building this correctly — with proper auth, availability windows, and payment flow — from scratch is a systems design exercise that surfaces real database and API design decisions.',
    solution: 'Designed a layered FastAPI backend with 20+ REST endpoints: route handlers → service layer → SQLAlchemy repository. Booking conflicts are prevented using database-level row locking (SELECT FOR UPDATE) inside a transaction, ensuring only one booking can claim a room for overlapping dates. JWT tokens (access + refresh) handle auth with role-based access control. Auto-generated OpenAPI docs via FastAPI serve as live documentation.',
    architecture: 'FastAPI routers → Pydantic schemas for validation → Service layer for business logic → SQLAlchemy ORM with PostgreSQL → Alembic for migrations. JWT auth middleware with role-based access control. Row-level locking for booking conflict prevention. Mock Stripe integration in the payment service layer.',
    impact: [
      'Live Swagger UI with 20+ REST endpoints — fully interactive documentation',
      'Zero double-booking bugs: row-level locking prevents race conditions under concurrent load',
      'Full booking lifecycle: search → reserve → pay → cancel with status transitions',
      'Role-based access control separates guest, host, and admin capabilities',
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


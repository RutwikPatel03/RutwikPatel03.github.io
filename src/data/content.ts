import type {
  Skills,
  Experience,
  Education,
  Project,
  Publication,
  BlogPost,
} from '@/types';

// Re-export types for backward compatibility
export type { Skills, Experience, Education, Project, Publication, BlogPost } from '@/types';

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

export const experience: Experience[] = [
  {
    company: 'Sigma Computing, New York, NY',
    title: 'Software Engineer Intern',
    period: 'Sept 2024 - Dec 2024',
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
    period: 'August 2023 - May 2025*',
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
  {
    title: 'Netflix Clone',
    category: 'web development',
    image: '/myimg/Project_Netflix_Clone.png',
    imageAlt: 'Netflix Clone - Full-stack streaming platform UI clone with user authentication and movie browsing built with Next.js, TypeScript, Tailwind CSS, and Supabase by Rutwik Patel',
    link: 'https://netflix-clone-opal-six-93.vercel.app',
    description: 'Full-stack Netflix clone with user authentication, movie browsing, My List, and trailer playback using TMDB API.',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase'],
    hasLiveDemo: true,
  },
  {
    title: 'Airbnb-Lite - Hotel Booking API',
    category: 'web development',
    image: '/myimg/Project_Airbnb-Lite.png',
    imageAlt: 'Airbnb-Lite API - Full-featured hotel booking backend with FastAPI, PostgreSQL, JWT auth, room management, and payment integration by Rutwik Patel',
    link: 'https://airbnblite-api.onrender.com/api/v1/docs',
    description: 'Full-featured hotel booking backend API with user authentication, hotel/room management, booking flow, and mock payment integration.',
    tech: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'JWT'],
    hasLiveDemo: true,
  },
  {
    title: 'Stock Insight Application (Web)',
    category: 'web development',
    image: '/myimg/Project_Stock_Web.png',
    imageAlt: 'Stock Insight Web Application - Real-time stock tracking dashboard built with Angular, Express, MongoDB deployed on Google Cloud Platform by Rutwik Patel',
    link: 'https://rutwikpatelassignment3.wl.r.appspot.com/',
    description: '',
    tech: ['Angular', 'Express', 'MongoDB', 'GCP'],
    hasLiveDemo: true,
  },
  {
    title: 'World Salon Website',
    category: 'web development',
    image: '/myimg/world-salon.jpg',
    imageAlt: 'World Salon Platform - Speaker sourcing and event management website built with React, Node.js, MongoDB, AWS by Rutwik Patel',
    link: 'https://www.world-salon.com',
    description: '',
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


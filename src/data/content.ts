export const skills = {
  programmingLanguages: ['Python', 'TypeScript', 'JavaScript', 'Go', 'Swift'],
  databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'Chroma', 'Redis'],
  frontend: ['React', 'Angular', 'Next.js', 'Redux', 'Zustand', 'Tailwind', 'Material UI', 'Jest', 'Cypress'],
  backend: ['Node.js', 'Express.js', 'Django REST', 'Flask', 'FastAPI', 'REST APIs', 'Microservices'],
  devops: ['AWS', 'GCP', 'Docker', 'CI/CD', 'Terraform'],
  machineLearning: ['PyTorch', 'TensorFlow', 'LangChain', 'RAG Systems', 'OpenAI Embeddings'],
};

export const experience = [
  {
    company: 'Sigma Computing, New York, NY',
    title: 'Software Engineer Intern',
    period: 'Sept 2025 - Dec 2025',
    description: [
      'Orchestrated better decision-making with formula-based data visualizations, improving data clarity for 60+ orgs.',
      'Ensured four smooth feature launches by driving work from development through prod and resolving issues pre-release.',
      'Increased production stability by expanding test coverage, catching regressions early and reducing post-release issues.',
      'Collaborated with product and design to refine feature behavior and edge cases, reducing overall support tickets.',
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

export const education = [
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

export const projects = [
  {
    title: 'Stock Insight Application (Web)',
    category: 'web development',
    image: '/myimg/Project_Stock_Web.png',
    link: 'https://rutwikpatelassignment3.wl.r.appspot.com/',
    description: 'Full-stack stock trading platform with Finnhub and Polygon APIs. Achieved 96% performance score through lazy loading, responsive Angular Material design, and optimized API caching.',
    tech: ['Angular', 'Express', 'MongoDB', 'GCP'],
  },
  {
    title: 'Cataract Detection with Explainable AI (XAI)',
    category: 'data science',
    image: '/myimg/Project_Cataract.png',
    link: 'https://github.com/RutwikPatel13/Cataract_Detection_with_XAI',
    description: 'Led team of 3 to develop CNN-based cataract detection system achieving 97% accuracy with explainable AI integration. Integrated GradCAM for visualizing model decisions.',
    tech: ['React', 'Python', 'CNN', 'XAI libraries'],
  },
  {
    title: 'RAG-based Q&A App',
    category: 'data science',
    image: '/myimg/Project_Blur.jpg',
    link: 'https://github.com/RutwikPatel13',
    description: 'RAG Q&A app with vector search and real-time retrieval, enabling sub-second search across private docs. Optimized pipeline reducing API calls by 30% and cutting 20% latency.',
    tech: ['Streamlit', 'LangChain', 'Chroma', 'OpenAI Embeddings'],
  },
  {
    title: 'Fake News Detection',
    category: 'data science',
    image: '/myimg/Project_FakeNews.png',
    description: 'Developed and benchmarked multiple deep learning architectures achieving 93% accuracy. Achieved 94% precision, recall, and F1-score on WELFake and Kaggle datasets with 115K+ articles.',
    tech: ['Python', 'CNN-LSTM', 'BERT', 'RoBERTa'],
  },
  {
    title: 'World Salon Website',
    category: 'web development',
    image: '/myimg/world-salon.png',
    link: 'https://www.world-salon.com',
    description: 'Event creation platform using MERN stack with JWT authentication and role-based access control.',
    tech: ['React', 'Node.js', 'MongoDB', 'AWS'],
  },
  {
    title: 'Inventory Management System',
    category: 'web development',
    image: '/myimg/Project_Inventory.jpg',
    link: 'https://github.com/RutwikPatel13/inventoryproject',
    description: 'Inventory management system with Django REST API and PostgreSQL. Dashboard analytics with sales trends, profit margins, and ABC analysis for 5000+ SKUs.',
    tech: ['Django', 'PostgreSQL', 'AWS EC2'],
  },
  {
    title: 'XBook - Second Hand Book Platform',
    category: 'web development',
    image: '/myimg/Project_XBOOK.png',
    link: 'https://github.com/RutwikPatel13/xbook',
    description: 'Platform for buying and selling second-hand books.',
    tech: ['Web Development'],
  },
  {
    title: 'Stock Insight Application (iOS)',
    category: 'ios',
    image: '/myimg/Project_Stock_iOS.png',
    link: 'https://www.youtube.com/watch?v=ePcyn-KFkc0',
    description: 'Complementary iOS app built in Swift replicating core web features for seamless cross-platform experience.',
    tech: ['Swift', 'iOS'],
  },
];

export const publications = [
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

export const blogPosts = [
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


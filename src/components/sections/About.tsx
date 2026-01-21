'use client';

import Link from 'next/link';
import type { PageType } from '@/types';

interface AboutProps {
  onPageChange?: (page: PageType) => void;
}

export default function About({ onPageChange }: AboutProps) {
  return (
    <article className="about active" data-page="About">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="about-text">
        <p>
          I&apos;m a Software Engineer and USC Master&apos;s graduate who thrives at the
          intersection of Full Stack Engineering and AI. Most recently, I interned at
          Sigma Computing, where I enhanced cloud analytics experiences through formula-based
          styling and TypeScript optimizations. Whether I&apos;m optimizing UI performance or
          architecting RAG systems for massive datasets, I love building tools that turn
          complex data into actionable insights.
        </p>

        <p>
          My journey began at the University of Mumbai and led to my Master&apos;s at USC,
          where I specialized in high-performance computing and AI. At World Salon, I
          re-architected payment microservices that boosted performance by 20% and
          integrated Stripe for monetized events, gaining deep exposure to FinTech
          workflows. Simultaneously, as a Researcher at USC Marshall, I tackled big data
          challenges—building pipelines to process 500GB+ of energy transition data and
          developing semantic search tools using Vector Databases.
        </p>

        <p>
          I&apos;m driven by the challenge of making complex systems efficient and
          accessible. Whether it&apos;s reducing cold start times for mobile apps or
          implementing Explainable AI (XAI) for medical diagnostics, I&apos;m passionate
          about engineering that solves specific, high-impact problems in SaaS, FinTech,
          and Healthcare.
        </p>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <h3 className="h3 skills-title">Technical Skills</h3>

        <div className="skills-grid">
          <div className="skill-category">
            <h4 className="skill-category-title">Languages</h4>
            <div className="skill-tags">
              <span className="skill-tag">Python</span>
              <span className="skill-tag">TypeScript</span>
              <span className="skill-tag">JavaScript</span>
              <span className="skill-tag">Go</span>
              <span className="skill-tag">Swift</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Frontend</h4>
            <div className="skill-tags">
              <span className="skill-tag">React</span>
              <span className="skill-tag">Next.js</span>
              <span className="skill-tag">Angular</span>
              <span className="skill-tag">Redux</span>
              <span className="skill-tag">Tailwind</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Backend</h4>
            <div className="skill-tags">
              <span className="skill-tag">Node.js</span>
              <span className="skill-tag">Express</span>
              <span className="skill-tag">Django</span>
              <span className="skill-tag">FastAPI</span>
              <span className="skill-tag">REST APIs</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Databases</h4>
            <div className="skill-tags">
              <span className="skill-tag">PostgreSQL</span>
              <span className="skill-tag">MongoDB</span>
              <span className="skill-tag">MySQL</span>
              <span className="skill-tag">Redis</span>
              <span className="skill-tag">Chroma</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Cloud & DevOps</h4>
            <div className="skill-tags">
              <span className="skill-tag">AWS</span>
              <span className="skill-tag">GCP</span>
              <span className="skill-tag">Docker</span>
              <span className="skill-tag">CI/CD</span>
              <span className="skill-tag">Terraform</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">AI/ML</h4>
            <div className="skill-tags">
              <span className="skill-tag">PyTorch</span>
              <span className="skill-tag">TensorFlow</span>
              <span className="skill-tag">LangChain</span>
              <span className="skill-tag">RAG</span>
              <span className="skill-tag">XAI</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <p className="cta-text">
            Open to Full-time Full Stack and AI/ML engineering roles
          </p>
          <div className="cta-buttons">
            <button
              onClick={() => onPageChange?.('Contact')}
              className="cta-btn primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Get in Touch
            </button>
            <Link href="/ai" className="cta-btn secondary">
              <span>✨</span>
              Ask AI About Me
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}


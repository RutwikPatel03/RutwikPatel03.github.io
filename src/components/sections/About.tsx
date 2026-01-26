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
          I&apos;m a Software Engineer and USC Master&apos;s graduate focused on building scalable full-stack systems and applied AI solutions.
        </p>

        <p>
          I&apos;ve shipped production features at Sigma Computing used by 60+ enterprise customers, where I worked on cloud analytics UI, formula-based styling, and TypeScript performance optimizations to reduce user friction. Previously at World Salon, I re-architected payment microservices, improving performance by 20%, and integrated Stripe to support monetized event workflows.
        </p>

        <p>
          Alongside industry work, I was a Research Assistant at USC Marshall, where I built large-scale data pipelines processing 500GB+ of energy transition data and developed semantic search systems using vector databases and RAG architectures.
        </p>

        <p>
          My strength lies in turning complex systems into reliable, usable products—whether that&apos;s optimizing frontend performance, designing backend APIs, or building AI-powered data workflows.
        </p>

        <p>
          I&apos;m open to full-time roles in Full Stack and AI Engineering. Happy to connect with engineers, founders, and recruiters.
        </p>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <h3 className="h3 skills-title">Technical Skills</h3>

        <div className="skills-grid">
          <div className="skill-category">
            <h4 className="skill-category-title">Languages & Core</h4>
            <div className="skill-tags">
              <span className="skill-tag">Python</span>
              <span className="skill-tag">TypeScript</span>
              <span className="skill-tag">JavaScript</span>
              <span className="skill-tag">SQL</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Frontend & Backend</h4>
            <div className="skill-tags">
              <span className="skill-tag">React</span>
              <span className="skill-tag">Next.js</span>
              <span className="skill-tag">Node.js</span>
              <span className="skill-tag">Django</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">AI/ML</h4>
            <div className="skill-tags">
              <span className="skill-tag">RAG Systems</span>
              <span className="skill-tag">LangChain</span>
              <span className="skill-tag">Vector Databases</span>
              <span className="skill-tag">PyTorch</span>
              <span className="skill-tag">TensorFlow</span>
            </div>
          </div>

          <div className="skill-category">
            <h4 className="skill-category-title">Infrastructure</h4>
            <div className="skill-tags">
              <span className="skill-tag">AWS</span>
              <span className="skill-tag">Docker</span>
              <span className="skill-tag">CI/CD</span>
              <span className="skill-tag">Terraform</span>
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


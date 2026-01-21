'use client';

import { useState } from 'react';
import Image from 'next/image';
import { projects } from '@/data/content';
import ProjectModal from '@/components/ProjectModal';

const categories = ['All', 'Web development', 'Data Science', 'iOS'];

type Project = typeof projects[0];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      activeFilter === 'All' ||
      project.category.toLowerCase() === activeFilter.toLowerCase()
  );

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <article className="portfolio" data-page="Portfolio">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        <ul className="filter-list">
          {categories.map((category) => (
            <li key={category} className="filter-item">
              <button
                className={activeFilter === category ? 'active' : ''}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>

        <div className="filter-select-box">
          <button
            className="filter-select"
            onClick={() => setIsSelectOpen(!isSelectOpen)}
          >
            <div className="select-value">{activeFilter}</div>
            <div className="select-icon">
              <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
              </svg>
            </div>
          </button>

          {isSelectOpen && (
            <ul className="select-list">
              {categories.map((category) => (
                <li key={category} className="select-item">
                  <button
                    onClick={() => {
                      setActiveFilter(category);
                      setIsSelectOpen(false);
                    }}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ul className="project-list">
          {filteredProjects.map((project, index) => (
            <li key={index} className="project-item active">
              <figure className="project-img">
                {/* Live Demo Badge */}
                {'hasLiveDemo' in project && project.hasLiveDemo && (
                  <div className="live-demo-badge">
                    <span className="pulse-dot"></span>
                    LIVE
                  </div>
                )}
                <div className="project-item-icon-box">
                  <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z" />
                    <circle cx="256" cy="256" r="80" />
                  </svg>
                </div>
                <Image
                  src={project.image}
                  alt={project.title}
                  width={300}
                  height={200}
                  loading="lazy"
                />
              </figure>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-category">{project.category}</p>

              {/* Action buttons */}
              <div className="project-actions">
                {'hasLiveDemo' in project && project.hasLiveDemo && (
                  <button
                    className="project-btn live-preview-btn"
                    onClick={() => openModal(project)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Live Preview
                  </button>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Visit
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </article>
  );
}


import { experience, education, skills } from '@/data/content';

export default function Resume() {
  return (
    <article className="resume" data-page="ExperienceEducation">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 160c16-63.16 76.43-95.41 208-96a15.94 15.94 0 0116 16v288a16 16 0 01-16 16c-128 0-177.45 25.81-208 64-30.37-38-80-64-208-64-9.88 0-16-8.84-16-17.37V80a15.94 15.94 0 0116-16c131.57.59 192 32.84 208 96zM256 160v288" />
            </svg>
          </div>
          <h3 className="h3">Experience</h3>
        </div>

        <ol className="timeline-list">
          {experience.map((item, index) => (
            <li key={index} className="timeline-item">
              <h4 className="h4">{item.company}</h4>
              <h4 className="h4 timeline-item-title">{item.title}</h4>
              <span>{item.period}</span>
              <p className="timeline-text">
                {item.description.map((desc, i) => (
                  <span key={i}>
                    - {desc}
                    {i < item.description.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 160c16-63.16 76.43-95.41 208-96a15.94 15.94 0 0116 16v288a16 16 0 01-16 16c-128 0-177.45 25.81-208 64-30.37-38-80-64-208-64-9.88 0-16-8.84-16-17.37V80a15.94 15.94 0 0116-16c131.57.59 192 32.84 208 96zM256 160v288" />
            </svg>
          </div>
          <h3 className="h3">Education</h3>
        </div>

        <ol className="timeline-list">
          {education.map((item, index) => (
            <li key={index} className="timeline-item">
              <h4 className="h4 timeline-item-title">{item.school}</h4>
              <p className="timeline-item-degree">{item.degree}</p>
              <span>{item.period}</span>
              <p className="timeline-text">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="skills">
        <h3 className="h3 skills-title">Skills</h3>
      </section>

      <section className="skills-container">
        <div className="skills-column">
          <h4>Languages</h4>
          <ul>
            {skills.programmingLanguages.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="skills-column">
          <h4>Databases</h4>
          <ul>
            {skills.databases.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="skills-column">
          <h4>Frontend</h4>
          <ul>
            {skills.frontend.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="skills-column">
          <h4>Backend & APIs</h4>
          <ul>
            {skills.backend.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="skills-column">
          <h4>Cloud & DevOps</h4>
          <ul>
            {skills.devops.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="skills-column">
          <h4>ML / Data</h4>
          <ul>
            {skills.machineLearning.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}


import Image from 'next/image';

export default function About() {
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
          <b>Technical Skills:</b>
          <br />
          <b>Languages:</b> Python, TypeScript, JavaScript, Go, Swift |{' '}
          <b>Databases:</b> PostgreSQL, MongoDB, MySQL, Chroma
          <br />
          <b>Frontend:</b> React, Angular, Next, React Hooks, Redux, Zustand, HTML/CSS, Jest, Cypress, Tailwind, Material UI
          <br />
          <b>Backend & APIs:</b> Node.js, Express.js, Django REST, Flask, REST APIs, Microservices, FastAPI, Redis
          <br />
          <b>Cloud & DevOps:</b> AWS, GCP, Docker, CI/CD, Terraform |{' '}
          <b>ML/Data:</b> PyTorch, TensorFlow, LangChain
        </p>

        <p>
          I&apos;m driven by the challenge of making complex systems efficient and
          accessible. Whether it&apos;s reducing cold start times for mobile apps or
          implementing Explainable AI (XAI) for medical diagnostics, I&apos;m passionate
          about engineering that solves specific, high-impact problems in SaaS, FinTech,
          and Healthcare.
        </p>

        <p>
          I&apos;m open to connecting with fellow engineers and recruiters to discuss
          opportunities in Full-time Full Stack development and AI roles. Feel free to
          message me here or reach out via email.
        </p>

        <p>📧 rutwikdh@usc.edu</p>
      </section>

      <section className="service">
        <h3 className="h3 service-title">What I&apos;m doing</h3>

        <ul className="service-list">
          <li className="service-item">
            <div className="service-icon-box">
              <Image src="/images/icon-design.svg" alt="design icon" width={40} height={40} />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Web Development</h4>
              <p className="service-item-text">
                High-quality development of sites at the professional level.
              </p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <Image src="/images/icon-dev.svg" alt="Web development icon" width={40} height={40} />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Software Development</h4>
              <p className="service-item-text">
                High-quality development and Scripting at the professional level.
              </p>
            </div>
          </li>

          <li className="service-item">
            <div className="service-icon-box">
              <Image src="/images/icon-app.svg" alt="mobile app icon" width={40} height={40} />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Mobile apps</h4>
              <p className="service-item-text">
                Professional development of applications for iOS.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </article>
  );
}


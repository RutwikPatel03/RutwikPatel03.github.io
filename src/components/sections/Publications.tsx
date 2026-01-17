import Image from 'next/image';
import { publications } from '@/data/content';

export default function Publications() {
  return (
    <article className="publication" data-page="Publication">
      <header>
        <h2 className="h2 article-title">Publication</h2>
      </header>

      <section className="blog-posts">
        <ul className="blog-posts-list">
          {publications.map((pub, index) => (
            <li key={index} className="blog-post-item">
              <a href={pub.link} target="_blank" rel="noopener noreferrer">
                <figure className="blog-banner-box">
                  <Image
                    src={pub.image}
                    alt={pub.title}
                    width={300}
                    height={200}
                    loading="lazy"
                  />
                </figure>

                <div className="blog-content">
                  <div className="blog-meta">
                    <p className="blog-category">{pub.category}</p>
                    <span className="dot"></span>
                    <time>{pub.date}</time>
                  </div>

                  <h3 className="h3 blog-item-title">{pub.title}</h3>

                  <p className="blog-text">
                    Publisher: {pub.publisher}
                    <br />
                    Published in: {pub.publishedIn}
                    <br />
                    ISBN: {pub.isbn}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}


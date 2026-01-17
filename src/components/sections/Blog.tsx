import Image from 'next/image';
import { blogPosts } from '@/data/content';

export default function Blog() {
  return (
    <article className="blog" data-page="Blog">
      <header>
        <h2 className="h2 article-title">Blog</h2>
      </header>

      <section className="blog-posts">
        <ul className="blog-posts-list">
          {blogPosts.map((post, index) => (
            <li key={index} className="blog-post-item">
              <a href={post.link || '#'} target={post.link ? '_blank' : undefined} rel="noopener noreferrer">
                <figure className="blog-banner-box">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={300}
                    height={200}
                    loading="lazy"
                  />
                </figure>

                <div className="blog-content">
                  {post.category && post.date && (
                    <div className="blog-meta">
                      <p className="blog-category">{post.category}</p>
                      <span className="dot"></span>
                      <time>{post.date}</time>
                    </div>
                  )}

                  <h3 className="h3 blog-item-title">{post.title}</h3>
                  <p className="blog-text">{post.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}


'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import About from '@/components/sections/About';
import Resume from '@/components/sections/Resume';
import Portfolio from '@/components/sections/Portfolio';
import Publications from '@/components/sections/Publications';
import Blog from '@/components/sections/Blog';
import Contact from '@/components/sections/Contact';
import type { PageType } from '@/types';

export default function Home() {
  const [activePage, setActivePage] = useState<PageType>('About');

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    window.scrollTo(0, 0);
  };

  return (
    <main>
      <Sidebar />

      <div className="main-content">
        <Navbar activePage={activePage} onPageChange={handlePageChange} />

        <div className="pages-container">
          <div className={activePage === 'About' ? 'page-visible' : 'page-hidden'}>
            <About onPageChange={handlePageChange} />
          </div>
          <div className={activePage === 'ExperienceEducation' ? 'page-visible' : 'page-hidden'}>
            <Resume />
          </div>
          <div className={activePage === 'Portfolio' ? 'page-visible' : 'page-hidden'}>
            <Portfolio />
          </div>
          <div className={activePage === 'Publication' ? 'page-visible' : 'page-hidden'}>
            <Publications />
          </div>
          <div className={activePage === 'Blog' ? 'page-visible' : 'page-hidden'}>
            <Blog />
          </div>
          <div className={activePage === 'Contact' ? 'page-visible' : 'page-hidden'}>
            <Contact />
          </div>
        </div>
      </div>
    </main>
  );
}


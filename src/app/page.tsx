import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import AboutNew from '@/components/sections/AboutNew';
import ExperienceNew from '@/components/sections/ExperienceNew';
import ProjectsNew from '@/components/sections/ProjectsNew';
import PublicationsNew from '@/components/sections/PublicationsNew';
import ContactNew from '@/components/sections/ContactNew';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <AboutNew />
        <ExperienceNew />
        <ProjectsNew />
        <PublicationsNew />
        <ContactNew />
      </main>
      <Footer />
    </>
  );
}


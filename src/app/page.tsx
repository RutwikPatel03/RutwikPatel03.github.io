import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';

// Dynamic imports for below-the-fold sections to reduce initial JS bundle
const About = dynamic(() => import('@/components/sections/About'), {
  loading: () => <div className="min-h-[400px]" />,
});
const Experience = dynamic(() => import('@/components/sections/Experience'), {
  loading: () => <div className="min-h-[600px]" />,
});
const Projects = dynamic(() => import('@/components/sections/Projects'), {
  loading: () => <div className="min-h-[600px]" />,
});
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), {
  loading: () => <div className="min-h-[400px]" />,
});
const Publications = dynamic(() => import('@/components/sections/Publications'), {
  loading: () => <div className="min-h-[400px]" />,
});
const Contact = dynamic(() => import('@/components/sections/Contact'), {
  loading: () => <div className="min-h-[400px]" />,
});

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Testimonials />
        <Publications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}


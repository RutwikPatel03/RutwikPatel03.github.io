import type { Metadata } from 'next';
import PageBar from '@/components/layout/PageBar';
import Footer from '@/components/layout/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { projects } from '@/data/content';
import ProjectsIndex from './ProjectsIndex';

export const metadata: Metadata = {
  title: 'Projects | Rutwik Patel',
  description:
    'Everything Rutwik Patel has built: App Store apps, RAG pipelines, backend APIs and web apps, each with a launch video and case studies.',
};

export default function ProjectsPage() {
  return (
    <>
      <PageBar current="Projects" />
      <main id="main-content" className="min-h-screen bg-paper px-4 pb-24 pt-10 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <SectionHeader
            as="h1"
            eyebrow="Home / Projects"
            title="All access"
            accent="passes."
            subtitle={`${projects.length} things I've built, from App Store apps to RAG pipelines. Open a pass for its video, live link or case study.`}
          />
          <ProjectsIndex />
        </div>
      </main>
      <Footer />
    </>
  );
}

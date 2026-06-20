'use client';

import { motion } from 'motion/react';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle, BentoCardDescription, BentoCardContent } from '@/components/ui/BentoGrid';
import GitHubActivity from '@/components/ui/GitHubActivity';
import SkillBar from '@/components/ui/SkillBar';
import { skillsWithLevels } from '@/data/content';

const stats = [
  { value: '2', label: 'IEEE Research Publications' },
  { value: '39K+', label: 'Records Processed via AI Pipelines' },
  { value: '1TB+', label: 'Data Processed Across AI Pipelines' },
  { value: '3.8', label: 'Graduate GPA' },
  { value: '12+', label: 'Production Features Shipped E2E' },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            About Me
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Software Engineer passionate about building scalable products and solving complex problems
          </p>
        </motion.div>

        <BentoGrid className="gap-4">
          {/* Bio Card - Full Width */}
          <BentoCard colSpan={3}>
            <BentoCardHeader>
              <BentoCardTitle>Who I Am</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <BentoCardDescription className="text-sm sm:text-base leading-relaxed">
                I&apos;m a Software Engineer and USC Master&apos;s graduate focused on building scalable full-stack systems and applied AI solutions.
                <br /><br />
                I&apos;ve shipped production features at Sigma Computing used by 60+ enterprise customers, where I worked on cloud analytics UI, formula-based styling, and TypeScript performance optimizations to reduce user friction. Previously at World Salon, I re-architected payment microservices, improving performance by 20%, and integrated Stripe to support monetized event workflows.
                <br /><br />
                Alongside industry work, I was a Research Assistant at USC Marshall, where I built large-scale data pipelines processing 500GB+ of energy transition data and developed semantic search systems using vector databases and RAG architectures.
                <br /><br />
                My strength lies in turning complex systems into reliable, usable products—whether that&apos;s optimizing frontend performance, designing backend APIs, or building AI-powered data workflows.
                <br /><br />
                I&apos;m open to full-time roles in Full Stack and AI Engineering. Happy to connect with engineers, founders, and recruiters.
              </BentoCardDescription>
            </BentoCardContent>
          </BentoCard>

          {/* Stats Card - Full Width Below */}
          <BentoCard colSpan={3}>
            <BentoCardHeader>
              <BentoCardTitle>Impact</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-2 sm:p-0">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </BentoCardContent>
          </BentoCard>

          {/* GitHub Activity Card */}
          <GitHubActivity />

          {/* Skills Cards */}
          {skillsWithLevels.map((category) => (
            <BentoCard key={category.title}>
              <BentoCardHeader className="flex flex-row items-center gap-2 mb-3">
                <category.icon className={`w-5 h-5 ${category.color}`} />
                <BentoCardTitle>{category.title}</BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent>
                <div className="space-y-3">
                  {category.skills.map((skill, i) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      color={category.color}
                      delay={i * 0.08}
                    />
                  ))}
                </div>
              </BentoCardContent>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}


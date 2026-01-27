'use client';

import { motion } from 'motion/react';
import { experience, education } from '@/data/content';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, GraduationCap, ExternalLink } from 'lucide-react';

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Experience & Education
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            My professional journey and academic background
          </p>
        </motion.div>

        {/* Experience Timeline */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h3 className="font-heading text-xl font-semibold text-foreground">Work Experience</h3>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            {experience.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative pl-8 md:pl-0 pb-12 last:pb-0 ${
                  index % 2 === 0 ? 'md:pr-[50%] md:text-right' : 'md:pl-[50%] md:text-left'
                }`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 md:left-1/2 top-0 w-3 h-3 rounded-full bg-blue-500 border-4 border-background -translate-x-1/2`} />

                <div className={`${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <Badge variant="outline" className="mb-2">{item.period}</Badge>
                  <h4 className="font-heading text-lg font-semibold text-foreground mt-1">{item.company}</h4>
                  <p className="text-muted-foreground font-medium">{item.title}</p>
                  
                  <ul className={`mt-3 space-y-2 text-sm text-muted-foreground ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    {item.description.map((desc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`text-muted-foreground/50 ${index % 2 === 0 ? 'md:order-last' : ''}`}>•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Highlights/Links */}
                  {'highlights' in item && item.highlights && (
                    <div className={`mt-3 flex flex-wrap gap-2 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                      {(item.highlights as Array<{text: string; link: string}>).map((highlight, i) => (
                        <a
                          key={i}
                          href={highlight.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          {highlight.text}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <h3 className="font-heading text-xl font-semibold text-foreground">Education</h3>
          </div>

          <div className="space-y-6">
            {education.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 border-l border-border"
              >
                <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-purple-500 border-4 border-background -translate-x-1/2" />
                <Badge variant="outline" className="mb-2">{item.period}</Badge>
                <h4 className="font-heading text-lg font-semibold text-foreground mt-1">{item.school}</h4>
                <p className="text-muted-foreground font-medium">{item.degree}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


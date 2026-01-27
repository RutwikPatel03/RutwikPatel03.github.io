'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { publications } from '@/data/content';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Calendar, BookOpen } from 'lucide-react';

export default function Publications() {
  return (
    <section id="publications" className="py-24 px-4 sm:px-6 lg:px-8">
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
            Publications
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Peer-reviewed research papers I&apos;ve authored
          </p>
        </motion.div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publications.map((pub, index) => (
            <motion.a
              key={pub.title}
              href={pub.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 backdrop-blur-sm hover:border-border/80 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Publication Image */}
                <div className="relative w-full sm:w-32 h-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={pub.image}
                    alt={pub.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Publication Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {pub.publisher}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {pub.date}
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-foreground group-hover:text-blue-500 transition-colors line-clamp-2">
                    {pub.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    <span className="line-clamp-1">{pub.publishedIn}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-500 group-hover:text-blue-400">
                    Read paper <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}


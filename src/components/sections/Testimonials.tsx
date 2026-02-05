'use client';

import { useState } from 'react';
import { testimonials } from '@/data/content';
import { SectionHeader } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_CHARS = 300;

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsExpanded(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsExpanded(false);
  };

  const currentTestimonial = testimonials[currentIndex];
  const isLongText = currentTestimonial.text.length > MAX_CHARS;
  const displayText = isExpanded || !isLongText
    ? currentTestimonial.text
    : currentTestimonial.text.slice(0, MAX_CHARS).trim() + '...';

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          title="Testimonials"
          subtitle="What people say about working with me"
          className="mb-16"
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              {/* Testimonial text */}
              <blockquote className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-loose font-light italic">
                &ldquo;{displayText}&rdquo;
                {isLongText && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 text-primary hover:text-primary/80 font-medium not-italic text-sm transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </blockquote>

              {/* Divider */}
              <div className="w-12 h-px bg-border mx-auto my-8" />

              {/* Author info */}
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {currentTestimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTestimonial.title}
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {currentTestimonial.company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prevTestimonial}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentIndex(index); setIsExpanded(false); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-foreground w-6'
                      : 'bg-foreground/20 hover:bg-foreground/40 w-1.5'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


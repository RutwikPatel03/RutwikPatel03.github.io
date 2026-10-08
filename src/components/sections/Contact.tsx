'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CopyButton } from '@/components/ui/CopyButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Barcode } from '@/components/ui/Barcode';
import { Lanyard, PunchSlot } from '@/components/ui/Lanyard';
import { ArrowRight, Linkedin, Github, MapPin, CheckCircle, XCircle, X } from 'lucide-react';
import { socialLinks as socialConfig, siteConfig } from '@/constants';
import { track } from '@/lib/analytics-client';

const socialLinks = [
  { icon: Linkedin, label: 'LinkedIn', href: socialConfig.linkedin },
  { icon: Github, label: 'GitHub', href: socialConfig.github },
];

type ToastType = 'success' | 'error' | null;

const fieldClass =
  'w-full rounded-[14px] border border-white/20 bg-ink-soft px-4 py-3.5 text-[17px] text-paper placeholder:text-[#8C867B] focus:border-gold focus:outline-none transition-colors';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Message sent successfully! I\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        showToast('error', data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      showToast('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // The visitor badge prints whatever is typed so far.
  const shownName = formData.name.trim() || 'Your name';
  const nameParts = formData.name.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length ? nameParts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') : '?';
  const shownEmail = formData.email.trim() || 'you@company.com';

  return (
    <section id="contact" className="bg-ink px-4 py-24 text-paper sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-start gap-14">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
            <SectionHeader
              tone="ink"
              eyebrow="05 Contact"
              title="Request"
              accent="access."
              subtitle="Fill in your visitor badge and send it over. It goes straight to my inbox."
              className="mb-0"
            />

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className="font-mono text-xs tracking-[0.12em] text-[#A8A296]">
                  YOUR NAME
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="font-mono text-xs tracking-[0.12em] text-[#A8A296]">
                  EMAIL
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="contact-message" className="font-mono text-xs tracking-[0.12em] text-[#A8A296]">
                  PURPOSE OF VISIT
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`${fieldClass} resize-none`}
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[54px] items-center gap-2.5 rounded-full bg-gold px-7 text-[17px] font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="flex flex-wrap items-center gap-2 text-[15px] text-[#A8A296]">
                  or email
                  <a href={`mailto:${siteConfig.author.email}`} className="text-paper hover:text-gold">
                    {siteConfig.author.email}
                  </a>
                  <CopyButton text={siteConfig.author.email} label="Copy" className="px-2 py-1 text-xs" />
                </span>
              </div>
            </motion.form>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('outbound_click', link.label)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-paper transition-colors hover:border-gold hover:text-gold"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </a>
              ))}
              <span className="inline-flex items-center gap-1.5 text-sm text-[#A8A296]">
                <MapPin className="h-4 w-4" />
                {siteConfig.author.location}
              </span>
            </div>
          </div>

          {/* The visitor badge, filled in live */}
          <div className="mx-auto flex flex-[0_1_340px] flex-col items-center pt-5">
            <div className="flex w-full animate-swing flex-col items-center [transform-origin:50%_-120px]">
              <Lanyard color="#FFCC00" length={120} />
              {/* Fluid up to 300px, so the swinging badge fits a 320px phone. */}
              <div className="mt-1 w-full max-w-[300px] overflow-hidden rounded-3xl bg-white text-ink shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
                <PunchSlot />
                <div className="mx-3.5 flex items-center justify-between rounded-[14px] bg-gold p-3.5">
                  <span className="font-display text-[26px] font-extrabold tracking-[-0.01em]">VISITOR</span>
                  <span className="font-mono text-[11px]">DAY PASS</span>
                </div>
                <div className="flex items-center gap-3.5 px-5 pt-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-ink font-display text-2xl font-extrabold text-gold">
                    {initials}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="break-words font-display text-[26px] font-extrabold leading-none tracking-[-0.03em]">
                      {shownName}
                    </span>
                    <span className="truncate text-sm text-taupe">{shownEmail}</span>
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2.5 px-5 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-taupe">HOST</dt>
                    <dd className="text-sm font-semibold">{siteConfig.name}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[10px] tracking-[0.1em] text-taupe">ACCESS</dt>
                    <dd className="text-sm font-semibold">Inbox</dd>
                  </div>
                </dl>
                <div className="flex justify-center px-5 py-5">
                  <Barcode value="VISITOR-PASS" height={34} />
                </div>
              </div>
            </div>
            <span className="mt-5 font-mono text-xs tracking-[0.12em] text-[#A8A296]">TYPE TO PRINT YOUR BADGE</span>
          </div>
        </div>
      </div>

      {/* Toast Notification - responsive positioning */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-4 sm:bottom-6 left-1/2 z-50 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg shadow-lg max-w-[90vw] sm:max-w-md ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium line-clamp-2">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="ml-1 sm:ml-2 p-1 hover:bg-white/20 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What file formats does ThreadCounty accept?',
    a: 'We accept JPG, PNG, and WebP images. The image should be at least 800×800 pixels for best results. Higher resolution images (2MP+) produce the most accurate thread density measurements.',
  },
  {
    q: 'How accurate is the AI thread count?',
    a: 'Our AI achieves 99.2% accuracy on standard weave types (plain, twill, satin), verified against lab measurements. Exotic weave patterns may have slightly lower accuracy. Each report includes a confidence score.',
  },
  {
    q: 'Can I analyze multiple fabric samples at once?',
    a: 'Pro and Enterprise plans support batch analysis — upload multiple images and receive reports for all of them simultaneously. Free plan analyzes one fabric at a time.',
  },
  {
    q: 'How is my fabric data protected?',
    a: 'All uploaded images are encrypted at rest and in transit using AES-256. We never share your fabric data with third parties. You can delete your data at any time from your dashboard.',
  },
  {
    q: 'What does the quality grade (A+ to D) mean?',
    a: 'Our grading follows industry-standard textile quality metrics including thread count, consistency, defect density, and weave regularity. A+ represents premium quality; grades below C indicate significant quality concerns.',
  },
  {
    q: 'Can I integrate ThreadCounty with my existing workflow?',
    a: 'Enterprise plans include API access for integrating ThreadCounty directly into your production software, ERP systems, or quality management platforms.',
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="border-b border-border last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium group-hover:text-primary transition-colors">{faq.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-5 pr-8">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-28 bg-secondary/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <div className="w-6 h-px bg-primary" />
            FAQ
            <div className="w-6 h-px bg-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to know about ThreadCounty. Can't find an answer? Contact our team.
          </p>
        </motion.div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y-0 px-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
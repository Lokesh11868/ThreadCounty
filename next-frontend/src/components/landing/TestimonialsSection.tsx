"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Quality Control Manager',
    company: 'IndoTex Mills',
    avatar: 'RK',
    rating: 5,
    text: "ThreadCounty has revolutionized our QC process. What used to take our team 2 days of manual counting now takes 10 seconds. The accuracy is remarkable.",
    color: 'from-violet-400 to-violet-600',
  },
  {
    name: 'Dr. Sneha Rao',
    role: 'Head of Procurement',
    company: 'Deccan Fabrics',
    avatar: 'SR',
    rating: 5,
    text: "The AI analysis caught inconsistencies in a fabric batch that our experienced team missed. This tool paid for itself on the first order it saved.",
    color: 'from-teal-400 to-teal-600',
  },
  {
    name: 'Amit Patel',
    role: 'Textile Engineer',
    company: 'Vardhman Textiles',
    avatar: 'AP',
    rating: 5,
    text: "The PDF reports are so professional that our clients actually reference them in their own documentation. The weave pattern detection is incredibly detailed.",
    color: 'from-amber-400 to-amber-600',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-28 bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <div className="w-6 h-px bg-primary" />
            Testimonials
            <div className="w-6 h-px bg-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Trusted by professionals
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hear from textile experts who've transformed their workflow with ThreadCounty.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>

              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
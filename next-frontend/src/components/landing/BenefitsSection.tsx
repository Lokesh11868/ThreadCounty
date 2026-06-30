"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, TrendingUp, Users } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: 'Eliminate Manual Counting',
    desc: 'Replace hours of tedious manual thread counting with instant AI analysis. Your team focuses on decisions, not data collection.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Clock,
    title: 'Speed Up QC by 98%',
    desc: 'Complete quality control checks in under 10 seconds. Analyze entire production batches in the time it used to take for one sample.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Improve Quality Standards',
    desc: 'Consistent, objective AI analysis removes human bias and fatigue. Every fabric is measured with the same precision every time.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Professional Reports',
    desc: "Impress clients and suppliers with detailed PDF reports that prove your quality standards. Build trust through transparency.",
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-28 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              <div className="w-6 h-px bg-primary" />
              Benefits
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Why teams{' '}
              <span className="text-gradient">switch to AI</span>{' '}
              analysis
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Traditional fabric quality control is slow, inconsistent, and expensive. ThreadCounty changes that by putting the power of AI in your hands.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium">Manual → Automated</div>
              <div className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium">Days → Seconds</div>
              <div className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium">Guesswork → Precision</div>
            </div>
          </motion.div>

          {/* Right cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${b.bg} flex items-center justify-center mb-3`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
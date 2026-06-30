"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BarChart3, Shield, Download, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Cpu,
    title: 'AI Thread Analysis',
    desc: 'Advanced computer vision algorithms detect and count individual threads with microscopic precision.',
    color: 'text-violet-500',
    bg: 'from-violet-500/10 to-violet-500/5',
    border: 'border-violet-500/20',
    span: 'md:col-span-2',
  },
  {
    icon: Eye,
    title: 'Weave Pattern Detection',
    desc: 'Automatically identify plain, twill, satin, and complex weave structures from a single image.',
    color: 'text-teal-500',
    bg: 'from-teal-500/10 to-teal-500/5',
    border: 'border-teal-500/20',
    span: '',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: 'Comprehensive analysis reports in under 10 seconds.',
    color: 'text-amber-500',
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    span: '',
  },
  {
    icon: BarChart3,
    title: 'Quality Grading',
    desc: 'Automated A+ through D quality grading based on industry-standard textile metrics.',
    color: 'text-violet-500',
    bg: 'from-violet-500/10 to-violet-500/5',
    border: 'border-violet-500/20',
    span: '',
  },
  {
    icon: Download,
    title: 'Export Reports',
    desc: 'Download professional PDF reports with all metrics, images, and AI recommendations.',
    color: 'text-teal-500',
    bg: 'from-teal-500/10 to-teal-500/5',
    border: 'border-teal-500/20',
    span: '',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'End-to-end encryption protects your fabric images and proprietary analysis data.',
    color: 'text-amber-500',
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    span: 'md:col-span-2',
  },
];

const container: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <div className="w-6 h-px bg-primary" />
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Precision at{' '}
            <span className="text-gradient">every fiber</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Powered by state-of-the-art computer vision models trained on millions of textile samples worldwide.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${f.bg} border ${f.border} p-6 cursor-default ${f.span}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-card border ${f.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              {/* Hover glow */}
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl ${f.bg}`} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/register">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group">
              Start analyzing for free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
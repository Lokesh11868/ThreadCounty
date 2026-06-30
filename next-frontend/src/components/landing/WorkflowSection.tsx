"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, BarChart3, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Your Fabric',
    desc: 'Drag and drop any fabric image — JPG, PNG, or WEBP. We accept samples from any angle or lighting condition.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Analysis Runs',
    desc: 'Our computer vision model scans every pixel, identifies thread patterns, counts density, and classifies the weave structure.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Review Insights',
    desc: 'View thread count, fabric grade, weave type, and AI recommendations in your interactive dashboard.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Download,
    number: '04',
    title: 'Export Reports',
    desc: 'Download a professional PDF report with all metrics, annotated images, and quality certifications.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
];

export default function WorkflowSection() {
  return (
    <section className="py-28 bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <div className="w-6 h-px bg-primary" />
            How it works
            <div className="w-6 h-px bg-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            From upload to insight{' '}
            <span className="text-gradient">in 4 steps</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No technical expertise required. Our platform guides you from raw fabric image to professional-grade report.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-4 gap-6">
          {/* Connection line */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative"
            >
              {/* Step card */}
              <div className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                {/* Number badge */}
                <div className="absolute -top-3 -left-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-background border border-border text-[10px] font-bold text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>

                <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
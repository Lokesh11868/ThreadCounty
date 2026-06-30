"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine, BarChart3, FileText, CheckCircle } from 'lucide-react';

export default function ProductOverviewSection() {
  return (
    <section className="py-28 bg-transparent border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 bg-accent/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Right visual first on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            {/* Report preview card */}
            <div className="rounded-3xl bg-background border border-border p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Analysis Report #2847</span>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-xs font-semibold">Complete</span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: ScanLine, label: 'Thread Count', value: '312 TPI', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                  { icon: CheckCircle, label: 'Weave Type', value: 'Plain Weave', color: 'text-teal-500', bg: 'bg-teal-500/10' },
                  { icon: BarChart3, label: 'Quality Grade', value: 'A+', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { icon: FileText, label: 'Confidence', value: '98.4%', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                ].map((m) => (
                  <div key={m.label} className="p-3.5 rounded-xl bg-secondary/50 border border-border">
                    <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
                      <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
                    <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                <p className="text-xs font-semibold text-primary mb-1.5">AI Recommendation</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fabric meets premium quality standards. Consistent thread density with no visible defects. Suitable for high-end apparel applications.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              <div className="w-6 h-px bg-primary" />
              Platform
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              A complete analysis{' '}
              <span className="text-gradient">platform</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              ThreadCounty is not just a thread counter. It's a full fabric intelligence platform that analyzes structure, classifies quality, identifies defects, and generates documentation — all automatically.
            </p>

            <div className="space-y-3">
              {[
                'Automatic weave pattern classification',
                'Thread density measurement in warp & weft',
                'Defect detection and flagging',
                'Batch comparison and trend tracking',
                'Exportable PDF certification reports',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {value}{suffix}
    </motion.span>
  );
}

const stats = [
  { value: '10K+', label: 'Fabric Analyses', sub: 'And counting daily', color: 'text-violet-600 dark:text-violet-400' },
  { value: '99.2%', label: 'Accuracy Rate', sub: 'Verified by lab testing', color: 'text-teal-600 dark:text-teal-400' },
  { value: '8.3s', label: 'Avg. Analysis Time', sub: 'From upload to report', color: 'text-amber-600 dark:text-amber-400' },
  { value: '150+', label: 'Fabric Types', sub: 'Recognized by our AI', color: 'text-violet-600 dark:text-violet-400' },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Trusted by textile professionals
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real numbers from real analyses performed on our platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-card border border-border backdrop-blur-sm text-center"
            >
              <div className={`text-4xl sm:text-5xl font-bold mb-1 ${stat.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="font-semibold text-foreground text-sm mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
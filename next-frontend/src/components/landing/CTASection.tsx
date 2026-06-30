"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-secondary/40 dark:bg-card border border-border p-12 sm:p-16 text-center shadow-lg"
        >
          {/* Gradient orbs inside */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />

          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Zap className="w-3.5 h-3.5 text-primary fill-primary/10" />
              <span className="text-xs font-semibold text-primary">Free to start, no credit card</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to see every{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient">thread clearly?</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Join thousands of textile professionals using AI to make faster, smarter quality decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-full h-12 px-8 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full h-12 px-8 text-base text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, ScanLine, BarChart3, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const floatingCards = [
  {
    icon: ScanLine,
    title: 'Thread Count',
    value: '312 TPI',
    sub: '+4.2% vs last batch',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    delay: 0,
  },
  {
    icon: BarChart3,
    title: 'Quality Grade',
    value: 'A+',
    sub: 'Premium classification',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    delay: 0.15,
  },
  {
    icon: FileCheck,
    title: 'Report Ready',
    value: '8.3s',
    sub: 'Analysis complete',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    delay: 0.3,
  },
];

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-transparent">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-violet-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[80px]" />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">AI-Powered Textile Analysis</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              See Every{' '}
              <span className="text-gradient">Thread.</span>
              <br />
              Know Every{' '}
              <span className="relative inline-block">
                Weave.
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-teal-500 origin-left"
                />
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg"
            >
              Upload any fabric image and receive instant AI analysis — thread density, weave patterns, quality grades, and professional PDF reports in under 10 seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-full h-12 px-8 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 gap-2 group"
                >
                  Start Analyzing Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base border-border/60 hover:bg-secondary gap-2">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-5 text-sm text-muted-foreground"
            >
              {[
                { dot: 'bg-teal-500', text: 'No credit card required' },
                { dot: 'bg-violet-500', text: '5 free analyses' },
                { dot: 'bg-amber-500', text: 'Results in seconds' },
              ].map(({ dot, text }) => (
                <span key={text} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative hidden lg:block space-y-6"
          >
            {/* Horizontal row of stat cards above the mockup card */}
            <div className="grid grid-cols-3 gap-4 items-end">
              {floatingCards.map((card, i) => {
                // Irregular floating animations (3 different cycle intervals & delays)
                const animationStyle = 
                  i === 0 ? 'float 5s ease-in-out infinite' :
                  i === 1 ? 'float 6.5s ease-in-out 1.2s infinite' :
                  'float 8s ease-in-out 2.4s infinite';
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5 + card.delay, type: 'spring', bounce: 0.2 }}
                    style={{ animation: animationStyle }}
                    className="glass border border-border rounded-2xl p-4 shadow-lg min-w-[150px] flex flex-col items-start"
                  >
                    <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-2 flex-shrink-0`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">{card.title}</p>
                    <p className="text-base font-bold mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{card.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-none">{card.sub}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Main app mockup card */}
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl shadow-black/10 font-medium">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400/70" />
                <div className="flex-1 mx-4 h-5 rounded-md bg-background/60 flex items-center px-3">
                  <span className="text-[9px] text-muted-foreground">threadcounty.com/report/analysis</span>
                </div>
              </div>
              {/* Mockup content */}
              <div className="p-6 space-y-4 bg-gradient-to-br from-card to-secondary/30 min-h-[320px]">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border overflow-hidden relative">
                    <img
                      src="/blue-cotton.png"
                      alt="Cotton Texture"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>cotton_sample_01.jpg</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[10px] font-semibold">Analyzed</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[['Thread Count', '312 TPI'], ['Weave', 'Plain'], ['Grade', 'A+']].map(([k, v]) => (
                        <div key={k} className="p-2 rounded-xl bg-background border border-border">
                          <p className="text-[9px] text-muted-foreground mb-0.5">{k}</p>
                          <p className="text-xs font-bold text-gradient">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Mini wave chart */}
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium" style={{ fontFamily: 'var(--font-display)' }}>Thread Density Analysis</p>
                    <span className="text-[10px] font-mono text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded">Real-time scan</span>
                  </div>
                  <div className="relative h-16 w-full py-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="50%" stopColor="hsl(var(--accent))" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" />
                        </linearGradient>
                      </defs>
                      {/* Area under the path */}
                      <motion.path
                        d="M 0 80 Q 40 35, 80 50 T 160 25 T 240 45 T 320 30 T 400 40 L 400 80 L 0 80 Z"
                        fill="url(#chartGradient)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      {/* Smooth wave line */}
                      <motion.path
                        d="M 0 80 Q 40 35, 80 50 T 160 25 T 240 45 T 320 30 T 400 40"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="2.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      {/* Animated scanning group containing vertical sweep line and glow dot */}
                      <g>
                        <animateMotion 
                          dur="4s" 
                          repeatCount="indefinite" 
                          path="M 0 80 Q 40 35, 80 50 T 160 25 T 240 45 T 320 30 T 400 40" 
                        />
                        {/* Scanning reference line (aligned with local origin x=0) */}
                        <line
                          x1="0"
                          y1="-100"
                          x2="0"
                          y2="100"
                          stroke="hsl(var(--accent) / 0.5)"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                        {/* Glowing dot (at local origin cx=0, cy=0) */}
                        <circle r="3.5" fill="hsl(var(--accent))" className="filter drop-shadow-[0_0_4px_rgba(20,184,166,0.8)]" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>


          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-border flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
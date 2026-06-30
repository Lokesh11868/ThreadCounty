"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScanLine, BarChart3, FileCheck, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const highlights = [
  { icon: ScanLine, text: 'Thread density analysis in seconds' },
  { icon: BarChart3, text: 'A+ to D quality grading' },
  { icon: FileCheck, text: 'Professional PDF reports' },
];

interface AuthLayoutProps {
  icon: any;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Form side */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md border border-border flex items-center justify-center bg-card">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-base hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
              Thread<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 drop-shadow-sm">County</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[400px]"
          >
            {/* Icon + heading */}
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex w-14 h-14 rounded-full bg-background dark:bg-[#13111c] border border-violet-500/20 shadow-[inset_0_0_15px_rgba(139,92,246,0.05)] items-center justify-center mb-6 hover:bg-secondary/50 dark:hover:bg-[#1c1827] transition-all hover:scale-105 cursor-pointer"
                title="Return to home"
              >
                <Icon className="w-6 h-6 text-violet-500 dark:text-violet-400" />
              </Link>
              <h1 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {footer && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right — Visual side (hidden on mobile) */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] bg-secondary/30 dark:bg-card border-l border-border flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 dot-grid opacity-10" />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center p-12 text-foreground">
          {/* Brand mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="mb-10"
          >
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-2xl border border-border flex items-center justify-center bg-card mx-auto mb-4">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
              AI-Powered Analysis
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-center mb-3 text-foreground leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Analyze any fabric<br />in <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 drop-shadow-sm">seconds</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground text-center mb-10 max-w-xs leading-relaxed"
          >
            Upload a fabric image and our AI measures thread density, identifies weave patterns, and grades quality automatically.
          </motion.p>

          <div className="w-full max-w-xs space-y-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card dark:bg-secondary border border-border shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <h.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 dark:text-foreground font-medium">{h.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
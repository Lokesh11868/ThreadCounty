"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "Our servers are currently sweating through 100% polyester.",
  "Sifting through data like trying to find the end of the scotch tape.",
  "We told the algorithm to look sharp. It's still getting dressed.",
  "Loading... because good material can't be rushed."
];

export default function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'fixed inset-0 bg-background z-50' : 'h-64'}`}>
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse border border-border bg-white flex items-center justify-center p-1.5">
          <img src="/logo.jpg" alt="Loading" className="w-full h-full object-cover rounded-2xl" />
        </div>
      </div>
      
      <div className="h-10 flex items-center justify-center">
        {mounted && (
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground text-center max-w-[280px]"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

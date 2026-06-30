"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 1800);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 3, 
            filter: 'blur(8px)',
            transition: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] } 
          }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ 
              scale: [0.3, 1, 0.95, 1.1], 
              opacity: [0, 1, 1, 1],
              transition: { 
                duration: 1.4,
                times: [0, 0.4, 0.8, 1],
                ease: "easeOut"
              } 
            }}
            className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/80 bg-card flex items-center justify-center p-3 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-teal-500/10" />
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[2rem] z-10" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

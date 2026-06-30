"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxFabric() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();

  // Transform values for deep 3D parallax layers based on whole page scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 900]);
  
  const rotateX = useTransform(scrollYProgress, [0, 1], [40, 80]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-20, 40]);
  
  const opacityFade = useTransform(scrollYProgress, [0, 0.8, 1], [0.6, 0.3, 0]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="relative w-[150vw] max-w-[1400px] h-[150vw] max-h-[1400px]"
          style={{
            rotateX,
            rotateZ,
            opacity: opacityFade,
            perspective: 1200,
            transformStyle: 'preserve-3d',
            x: '20%' // Offset to the right
          }}
        >
          {/* Layer 1: Base Mesh */}
          <motion.div 
            className="absolute inset-0 border-[1px] border-primary/20 rounded-[40%]"
            style={{ 
              y: y1, 
              translateZ: -300,
              background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
              boxShadow: '0 0 80px rgba(139, 92, 246, 0.1)'
            }}
          >
            <svg width="100%" height="100%" className="opacity-30">
              <pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/40"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid1)" />
            </svg>
          </motion.div>

          {/* Layer 2: Core Glowing Threads */}
          <motion.div 
            className="absolute inset-[15%] border-[2px] border-teal-500/20 rounded-[35%]"
            style={{ 
              y: y2, 
              translateZ: 0,
              background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.05) 0%, transparent 60%)',
              boxShadow: '0 0 120px rgba(20, 184, 166, 0.15)'
            }}
          >
            <svg width="100%" height="100%" className="opacity-40">
              <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-500/40"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid2)" />
            </svg>
          </motion.div>

          {/* Layer 3: Floating Accent Lines */}
          <motion.div 
            className="absolute -inset-[10%] border-[1px] border-violet-400/15 rounded-[45%]"
            style={{ 
              y: y3, 
              translateZ: 300,
              boxShadow: 'inset 0 0 60px rgba(139, 92, 246, 0.1)'
            }}
          >
            <svg width="100%" height="100%" className="opacity-30">
              <pattern id="grid3" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-400/30"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid3)" />
            </svg>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Eye, Cpu, ArrowRight, History, Users, Code, Database, 
  Layers, Network, ChevronRight, CheckCircle2, Award, Zap, Sparkles, Globe
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const team = [
  { 
    name: 'Dr. L. S. Admuthe', 
    role: 'CEO & Founder', 
    bio: 'Former Professor of Textile Engineering with 15+ years researching automated computer vision applications in material sciences.',
    initials: 'LA', 
    color: 'from-violet-500 to-indigo-600',
    social: { linkedin: '#', twitter: '#' }
  },
  { 
    name: 'Dr. U. J. Patil', 
    role: 'CTO', 
    bio: 'Distributed systems architect. Previously led engineering teams developing real-time edge intelligence solutions for factory automation.',
    initials: 'UP', 
    color: 'from-teal-400 to-emerald-600',
    social: { linkedin: '#', github: '#' }
  },
  { 
    name: 'Dr. S. K. Shirgave', 
    role: 'Head of AI Research', 
    bio: 'Ph.D. in Computer Vision. Published author of 10+ papers on micro-texture classification and deep neural network optimization.',
    initials: 'DK', 
    color: 'from-amber-400 to-orange-600',
    social: { googleScholar: '#', github: '#' }
  },
  { 
    name: 'Dr. Manjunath C. Burji', 
    role: 'Lead UX Designer', 
    bio: 'Passionate about making complex statistical data intuitive. Formerly designed industrial control interfaces and mobile analytics apps.',
    initials: 'SM', 
    color: 'from-fuchsia-400 to-pink-600',
    social: { linkedin: '#', dribbble: '#' }
  },
];

const timeline = [
  { 
    year: '2021', 
    title: 'Founding ThreadCounty',
    event: 'Spun out of university research labs with a bold vision: to replace error-prone manual pick glass analysis with absolute digital precision using computer vision.',
    icon: Sparkles,
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/20'
  },
  { 
    year: '2022', 
    title: 'The Core Engine v1.0',
    event: 'Developed and certified our core AI thread-counting model. Achieved a record-breaking 98.4% accuracy rate on basic cotton, linen, and plain weave fabrics.',
    icon: Cpu,
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
  },
  { 
    year: '2023', 
    title: 'Going Global & Complex Weaves',
    event: 'Expanded neural networks to detect complex weave structures including twill, satin, and jacquard. Reached 10,000+ active QC analysts globally.',
    icon: Globe,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  { 
    year: '2024', 
    title: 'Enterprise Integration & APIs',
    event: 'Launched real-time API integrations for looms, web-based quality management portals, and cloud sync dashboards to orchestrate QC across multiple factories.',
    icon: Award,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  },
];

const techStack = [
  {
    category: 'Artificial Intelligence',
    icon: Network,
    description: 'Advanced computer vision and neural networks tailored for micro-texture classification.',
    techs: [
      { name: 'PyTorch', desc: 'Custom Convolutional Neural Networks (CNNs) for thread counting.' },
      { name: 'OpenCV', desc: 'Advanced image pre-processing, contrast enhancement, and scale normalization.' },
      { name: 'FFT (Fast Fourier Transform)', desc: 'Frequency domain analysis to detect weave pattern periodicity.' }
    ]
  },
  {
    category: 'Frontend & UI Engine',
    icon: Code,
    description: 'High-performance interactive dashboards providing lightning-fast rendering of fabric scan analyses.',
    techs: [
      { name: 'Next.js 16 (React 19)', desc: 'Server-side rendering, routing, and interactive client components.' },
      { name: 'Tailwind CSS v4', desc: 'Modern responsive styling with customized color-mix systems.' },
      { name: 'Base UI & Framer Motion', desc: 'Accessible components with fluid micro-interactions and transitions.' }
    ]
  },
  {
    category: 'Backend & Operations',
    icon: Database,
    description: 'Highly secure, scalable API layer and databases ensuring reliable reporting and history tracking.',
    techs: [
      { name: 'FastAPI (Python)', desc: 'Asynchronous API endpoints connecting our AI core with client nodes.' },
      { name: 'Supabase & PostgreSQL', desc: 'Secure database, authentication services, and JSON report storage.' },
      { name: 'Next.js Turbopack', desc: 'Optimized bundler for rapid development iterations and clean production build assets.' }
    ]
  }
];

export default function About() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision'>('mission');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] dark:bg-primary/10" />
          <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] dark:bg-indigo-500/8" />
          <div className="absolute inset-0 dot-grid opacity-30" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/50 text-xs font-semibold uppercase tracking-widest text-primary mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Company Story
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
              Weaving precision into the <br />
              <span className="text-gradient">fabric of textile QC</span>
            </h1>
            
            <div className="grid md:grid-cols-5 gap-8 items-start mt-12">
              <p className="md:col-span-3 text-lg sm:text-xl text-muted-foreground leading-relaxed">
                ThreadCounty was founded to bridge the gap between age-old textile expertise and modern automation. Quality control in fabric manufacturing has historically relied on the naked eye and manual tools. We built a platform to automate this, transforming manual workflows into instant, lab-grade digital insights.
              </p>
              <div className="md:col-span-2 p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
                <div className="text-sm font-semibold uppercase text-muted-foreground mb-4">Established</div>
                <div className="text-4xl font-bold text-primary mb-2 font-mono">2021</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Headquartered globally with processing cores scanning thousands of fabrics every single day.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story, Mission & Vision Section */}
      <section className="py-24 bg-secondary/20 border-y border-border/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Visual Story Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">Foundational Pillars</div>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Driven by a commitment to standardizing quality.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our founders recognized that consistency is the greatest challenge in manufacturing. By creating a unified digital benchmark, ThreadCounty enables mills, brands, and designers to speak the same language.
              </p>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1.5 bg-card border border-border/60 rounded-xl max-w-xs shadow-sm">
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'mission' 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'vision' 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Our Vision
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Mission/Vision Card */}
            <div className="lg:col-span-7 h-96 relative flex items-center">
              <AnimatePresence mode="wait">
                {activeTab === 'mission' ? (
                  <motion.div
                    key="mission"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full bg-card border border-border shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start gap-5">
                      <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
                        <Target className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Our Mission</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          To democratize advanced materials testing by placing automated computer vision tools in the hands of every manufacturer and fashion designer globally. We strive to reduce waste, secure structural integrity, and optimize textile testing.
                        </p>
                        <div className="space-y-3">
                          {[
                            'Provide instant, high-fidelity fabric thread counts.',
                            'Minimize manufacturing waste through rapid weave classification.',
                            'Guarantee repeatable, standardized testing records.'
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                              <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="vision"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full bg-card border border-border shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start gap-5">
                      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
                        <Eye className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Our Vision</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          To establish ThreadCounty as the absolute international standard for fabric quality analysis. We envision a future where digital inspection platforms completely eliminate manual material audits, allowing for full supply-chain transparency and zero error rates.
                        </p>
                        <div className="space-y-3">
                          {[
                            'Pioneer fully autonomous on-loom sensor analyses.',
                            'Define standard electronic metadata descriptors for textile quality.',
                            'Build an open, AI-driven registry for worldwide fabric types.'
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Technology Stack Showdown */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              <Code className="w-4 h-4" />
              Technology Stack
            </div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Built with cutting-edge infrastructure
            </h2>
            <p className="text-muted-foreground mt-3">
              Our engineering merges robust frontend systems with powerful neural engines to process fabric scans in milliseconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {techStack.map((stack, i) => (
              <motion.div
                key={stack.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                    <stack.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>{stack.category}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{stack.description}</p>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-border/60">
                  {stack.techs.map((tech) => (
                    <div key={tech.name} className="flex flex-col gap-0.5">
                      <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground/90">
                        <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                        {tech.name}
                      </div>
                      <div className="text-xs text-muted-foreground pl-5">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-secondary/10 border-y border-border/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              <History className="w-4 h-4" />
              Timeline
            </div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Our Journey</h2>
            <p className="text-muted-foreground mt-3">From laboratory concept to global industry software.</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-px bg-border/80 -translate-x-1/2" />

            <div className="space-y-12">
              {timeline.map((item, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex flex-col md:flex-row relative items-start ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Central Marker */}
                    <div className="absolute left-[28px] md:left-1/2 top-2 -translate-x-1/2 z-10 flex items-center justify-center">
                      <div className={`w-14 h-14 rounded-full border-4 border-background flex items-center justify-center shadow-md ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                        <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          {item.year}
                        </span>
                        <h3 className="text-lg font-bold mt-3 mb-2" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.event}</p>
                      </div>
                    </div>

                    {/* Spacer for MD screens */}
                    <div className="hidden md:block w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              <Users className="w-4 h-4" />
              The Team
            </div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Meet the experts</h2>
            <p className="text-muted-foreground mt-3">
              A diverse team combining specialized textile engineering, computer vision research, and beautiful user experience design.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-card border border-border rounded-3xl p-6 hover:border-primary/30 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-extrabold text-2xl mb-6 shadow-md`}>
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>{member.name}</h3>
                  <div className="text-xs font-semibold text-primary mt-1 mb-4">{member.role}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
                
                {/* Visual Accent footer inside card */}
                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <span>ThreadCounty Specialist</span>
                  <Zap className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center relative overflow-hidden bg-secondary/10 border-t border-border/60">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto px-4 relative z-10"
        >
          <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Elevate your textile standards today
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Join leading manufacturers, supply chain inspectors, and apparel brands leveraging ThreadCounty for automated precision audits.
          </p>
          <Link href="/register">
            <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/10 transition-all group">
              Start Free Scan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
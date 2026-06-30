"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactApi } from '@/lib/apiClient';

import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2, Globe, MessageSquare, AlertCircle } from 'lucide-react';
import { Github, Twitter, Linkedin } from '@/components/SocialIcons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setErrorMsg('');
    try {
      await contactApi.sendContactMessage(form);
      setSent(true);
      toast({ 
        title: 'Message Sent', 
        description: 'Thank you! Your message has been sent, and we have dispatched a notification email via Resend API.' 
      });
    } catch (e: any) {
      console.error(e);
      const detail = e?.message || 'Failed to send message. Please check if backend is running.';
      setErrorMsg(detail);
      toast({ 
        title: 'Submission Error', 
        description: detail, 
        variant: 'destructive' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] dark:bg-primary/8" />
          <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/4 rounded-full blur-[100px] dark:bg-indigo-500/8" />
          <div className="absolute inset-0 dot-grid opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/50 text-xs font-semibold uppercase tracking-widest text-primary mb-5 shadow-sm">
              <MessageSquare className="w-3.5 h-3.5" />
              Get In Touch
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Let's build something <br />
              <span className="text-gradient">exceptional together</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Have questions about ThreadCounty AI engine, integration, or custom licensing? Contact us, and we will get back to you shortly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* Left Column: Contact Info & Map */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Contact Info Cards */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-5 shadow-sm">
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Contact Information</h3>
                
                {[
                  { icon: Mail, label: 'Email Address', value: 'hello@threadcounty.com', href: 'mailto:hello@threadcounty.com' },
                  { icon: MapPin, label: 'DKTESTEI Campus Location', value: 'Ichalkaranji, Maharashtra, India', href: 'https://maps.google.com/?q=DKTE+Society\'s+Textile+and+Engineering+Institute' },
                  { icon: Phone, label: 'Campus Office Phone', value: '+91 (230) 243-0373', href: 'tel:+912302430373' },
                ].map((info) => (
                  <a 
                    key={info.label} 
                    href={info.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-3 rounded-2xl hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-105 transition-transform">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{info.label}</p>
                      <p className="text-sm font-semibold text-foreground/90 mt-0.5 group-hover:text-primary transition-colors">{info.value}</p>
                    </div>
                  </a>
                ))}

                {/* Social Channels */}
                <div className="pt-4 border-t border-border/60">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Connect Online</p>
                  <div className="flex gap-2">
                    {[
                      { Icon: Github, href: 'https://github.com' },
                      { Icon: Twitter, href: 'https://twitter.com' },
                      { Icon: Linkedin, href: 'https://linkedin.com' }
                    ].map((item, i) => (
                      <a 
                        key={i} 
                        href={item.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center border border-border/30 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                      >
                        <item.Icon className="w-4.5 h-4.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Google Maps Embed Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-2 shadow-sm overflow-hidden">
                <div className="h-72 rounded-2xl overflow-hidden border border-border/50 relative group">
                  <iframe
                    src="https://maps.google.com/maps?q=DKTE%20Society%27s%20Textile%20%26%20Engineering%20Institute%2C%20Ichalkaranji%2C%20Maharashtra&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="scale-[1.01]"
                  />
                </div>
              </div>

            </motion.div>

            {/* Right Column: Interactive Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div 
                    key="sent-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border border-border rounded-3xl p-10 md:p-14 text-center shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
                    </div>
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>Message Dispatched</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8 text-sm">
                      We have received your message. A confirmation email has been dispatched via the Resend API.
                    </p>
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8 py-4 text-xs font-semibold hover:bg-secondary border-border/80" 
                      onClick={() => { 
                        setSent(false); 
                        setForm({ name: '', email: '', subject: '', message: '' }); 
                      }}
                    >
                      Send Another Inquiry
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form-state"
                    onSubmit={handleSubmit} 
                    className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative"
                  >
                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground">Full Name *</Label>
                        <Input 
                          value={form.name} 
                          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
                          placeholder="Your name" 
                          className="rounded-xl mt-1.5 h-11 border-border/80 focus:ring-primary/20" 
                          required 
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground">Email Address *</Label>
                        <Input 
                          type="email" 
                          value={form.email} 
                          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} 
                          placeholder="you@example.com" 
                          className="rounded-xl mt-1.5 h-11 border-border/80 focus:ring-primary/20" 
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Subject</Label>
                      <Input 
                        value={form.subject} 
                        onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} 
                        placeholder="What's this regarding?" 
                        className="rounded-xl mt-1.5 h-11 border-border/80 focus:ring-primary/20" 
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Message Body *</Label>
                      <Textarea 
                        value={form.message} 
                        onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} 
                        placeholder="Provide details about your inquiry..." 
                        rows={6} 
                        className="rounded-xl mt-1.5 resize-none border-border/80 focus:ring-primary/20" 
                        required 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={sending} 
                      className="w-full rounded-xl h-12 gap-2 text-sm font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
                    >
                      {sending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? 'Dispatching Message...' : 'Send Message'}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
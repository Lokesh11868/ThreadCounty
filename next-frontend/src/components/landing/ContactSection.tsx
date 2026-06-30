"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle } from 'lucide-react';
import { Github, Twitter, Linkedin } from '@/components/SocialIcons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { contactApi } from '@/lib/apiClient';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await contactApi.sendContactMessage(form);
      setSent(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <div className="w-6 h-px bg-primary" />
            Contact
            <div className="w-6 h-px bg-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Get in touch
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have questions about ThreadCounty? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              { icon: Mail, label: 'EMAIL ADDRESS', value: 'hello@threadcounty.com' },
              { icon: MapPin, label: 'DKTESTEI CAMPUS LOCATION', value: 'Ichalkaranji, Maharashtra, India' },
              { icon: Phone, label: 'CAMPUS OFFICE PHONE', value: '+91 (230) 243-0373' },
            ].map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{info.label}</p>
                  <p className="text-sm font-medium">{info.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">Follow Us</p>
              <div className="flex gap-2">
                {[{ Icon: Github, href: '#' }, { Icon: Twitter, href: '#' }, { Icon: Linkedin, href: '#' }].map(({ Icon, href }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            {sent ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-teal-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-teal-500" />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Message Sent!</h3>
                <p className="text-sm text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Email *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="What's this about?"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Message *</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us more..."
                    rows={5}
                    className="rounded-xl resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl h-11 gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
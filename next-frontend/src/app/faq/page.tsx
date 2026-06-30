"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    title: 'Platform',
    questions: [
      { q: 'What is ThreadCounty?', a: 'ThreadCounty is an AI-powered textile technology platform that analyzes fabric structures using Computer Vision. Upload fabric images and receive automated thread density analysis, weave pattern identification, and professional quality reports.' },
      { q: 'Who is ThreadCounty for?', a: 'ThreadCounty is designed for textile manufacturers, quality control professionals, students, researchers, and anyone working with fabrics who needs accurate thread analysis.' },
      { q: 'How does the AI analysis work?', a: 'Our computer vision models detect individual threads in your fabric image, measure their density, identify the weave pattern, and generate a comprehensive quality report in under 10 seconds.' },
    ],
  },
  {
    title: 'AI Analysis',
    questions: [
      { q: 'How accurate is the analysis?', a: 'Our AI models achieve over 99% accuracy on standard fabric types. Accuracy depends on image quality. Well-lit, close-up images of flat fabric surfaces yield the best results.' },
      { q: 'What fabric types are supported?', a: 'ThreadCounty supports analysis of cotton, polyester, silk, linen, wool, denim, satin, and many more fabric types. Our AI continuously learns to recognize new materials.' },
      { q: 'What metrics are included in a report?', a: 'Reports include thread density, warp count, weft count, fabric type identification, weave pattern, quality grade (A+ to D), confidence score, and AI-powered improvement suggestions.' },
    ],
  },
  {
    title: 'Pricing & Plans',
    questions: [
      { q: 'Is there a free plan?', a: 'Yes! Our free plan includes 5 uploads per month with basic thread analysis and standard reports. No credit card required.' },
      { q: 'Can I upgrade or downgrade?', a: 'Absolutely. You can change your plan at any time. Changes take effect immediately, and billing differences are prorated.' },
      { q: 'Do you offer educational discounts?', a: 'Yes, our Student plan at $9/month is designed specifically for textile students and researchers with a valid educational email address.' },
    ],
  },
  {
    title: 'Upload & Images',
    questions: [
      { q: 'What image formats are supported?', a: 'We accept JPG, JPEG, and PNG image formats. Images should be clear, well-lit, and show the fabric surface at close range for best results.' },
      { q: 'What is the maximum file size?', a: 'The maximum file size is 10MB per image. We recommend images of at least 1 megapixel resolution for optimal analysis accuracy.' },
      { q: 'Are my images kept private?', a: 'Yes. All uploaded images are encrypted and stored securely. Only you and authorized administrators can access your uploads. We never share your data with third parties.' },
    ],
  },
  {
    title: 'Account',
    questions: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your inbox.' },
      { q: 'Can I delete my account?', a: 'Yes, you can request account deletion from your Profile page. All your data, including uploads and reports, will be permanently removed within 30 days.' },
      { q: 'Is my data secure?', a: 'We use enterprise-grade encryption for all data in transit and at rest. Our infrastructure is hosted on secure cloud providers with SOC 2 compliance.' },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">FAQ</span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need to know about ThreadCounty and our AI textile analysis platform.
            </p>
          </motion.div>

          <div className="space-y-8">
            {faqCategories.map((cat, ci) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.1 }}
              >
                <h2 className="font-display font-semibold text-lg mb-3">{cat.title}</h2>
                <Accordion className="bg-card rounded-2xl border border-border/30 overflow-hidden">
                  {cat.questions.map((faq, i) => (
                    <AccordionItem key={i} value={`${cat.title}-${i}`} className="border-border/30">
                      <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline hover:bg-muted/50">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
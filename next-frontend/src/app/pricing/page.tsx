"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    desc: 'Explore AI analysis, no commitment.',
    features: ['5 uploads/month', 'Basic thread analysis', 'Standard reports', 'Email support'],
    cta: 'Get Started',
    href: '/register',
    popular: false,
    accent: 'border-border',
  },
  {
    name: 'Student',
    price: '₹750',
    period: '/month',
    desc: 'For textile students and researchers.',
    features: ['50 uploads/month', 'Advanced AI analysis', 'PDF exports', 'Weave pattern detection', 'Priority support'],
    cta: 'Start Free Trial',
    href: '/register',
    popular: false,
    accent: 'border-border',
  },
  {
    name: 'Professional',
    price: '₹2,490',
    period: '/month',
    desc: 'The full power for QC professionals.',
    features: ['Unlimited uploads', 'Full AI analysis suite', 'Custom-branded reports', 'REST API access', 'Batch processing', 'Dedicated support'],
    cta: 'Start Free Trial',
    href: '/register',
    popular: true,
    accent: 'border-primary',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Tailored for large organizations.',
    features: ['Unlimited everything', 'Custom AI model training', 'On-premise deployment', 'SLA guarantee', 'Team management', 'White-label option'],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
    accent: 'border-border',
  },
];

import { useToast } from '@/components/ui/use-toast';

import { load } from '@cashfreepayments/cashfree-js';

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (plan: any) => {
    setLoadingPlan(plan.name);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.name.toLowerCase(),
          price: plan.price.replace(/[^0-9]/g, ''),
          planName: plan.name,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
      
      if (data.payment_session_id) {
        const cashfree = await load({
          mode: "sandbox", // use 'production' for live
        });
        
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self"
        });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-3xl" />
          <div className="absolute inset-0 dot-grid opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              <div className="w-6 h-px bg-primary" />
              Pricing
              <div className="w-6 h-px bg-primary" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Simple,{' '}
              <span className="text-gradient">transparent</span>{' '}
              pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime. Start for free.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl border bg-card p-6 flex flex-col ${plan.accent} ${
                  plan.popular ? 'shadow-xl shadow-primary/10 ring-1 ring-primary/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md">
                      <Sparkles className="w-3 h-3" />Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{plan.price}</span>
                    <span className="text-sm text-muted-foreground mb-0.5">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.price === 'Custom' || plan.price === '₹0' ? (
                  <Link href={plan.href}>
                    <Button
                      className={`w-full rounded-xl h-10 gap-1.5 ${
                        plan.popular
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                          : 'bg-secondary border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full rounded-xl h-10 gap-1.5 ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                        : 'bg-secondary border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                    }`}
                  >
                    {loadingPlan === plan.name ? 'Processing...' : plan.cta}
                    {!loadingPlan && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-14 text-center"
          >
            <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {['14-day free trial on all paid plans', 'No credit card required to start', 'Cancel anytime, no questions asked'].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
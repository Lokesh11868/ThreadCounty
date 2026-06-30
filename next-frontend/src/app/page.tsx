import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import IntroSplash from '@/components/landing/IntroSplash';
import ParallaxFabric from '@/components/landing/ParallaxFabric';

// Lazy loaded components (below the fold)
const ProductOverviewSection = dynamic(() => import('@/components/landing/ProductOverviewSection'), { ssr: true });
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), { ssr: true });
const BenefitsSection = dynamic(() => import('@/components/landing/BenefitsSection'), { ssr: true });
const WorkflowSection = dynamic(() => import('@/components/landing/WorkflowSection'), { ssr: true });
const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), { ssr: true });
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), { ssr: true });
const FAQSection = dynamic(() => import('@/components/landing/FAQSection'), { ssr: true });
const ContactSection = dynamic(() => import('@/components/landing/ContactSection'), { ssr: true });
const CTASection = dynamic(() => import('@/components/landing/CTASection'), { ssr: true });

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      <ParallaxFabric />
      <Navbar />
      <HeroSection />
      <ProductOverviewSection />
      <FeaturesSection />
      <BenefitsSection />
      <WorkflowSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { reportApi } from '@/lib/apiClient';

import {
  ArrowLeft, Download, FileText,
  Layers, Grid3X3, Target, Award, Cpu, Lightbulb, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import PageLoader from '@/components/layout/PageLoader';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof id === 'string') {
      reportApi.getReport(id)
        .then(setReport)
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDownload = async () => {
    if (!report) return;
    try {
      toast({ title: 'Generating PDF', description: 'Please wait, generating your report...' });
      const domtoimage = (await import('dom-to-image-more')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = document.getElementById('report-content');
      if (!element) return;
      
      const dataUrl = await domtoimage.toPng(element, { 
        quality: 1.0, 
        scale: 2
      });
      
      const imgProps = await new Promise<any>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = dataUrl;
      });

      const pdf = new jsPDF({
        orientation: imgProps.width > imgProps.height ? 'l' : 'p',
        unit: 'px',
        format: [imgProps.width, imgProps.height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height);
      pdf.save(`ThreadCounty_Report_${report.id}.pdf`);
      
      toast({ title: 'Report Downloaded', description: 'Your PDF report has been downloaded successfully.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Download failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!report) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border border-border">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h2 className="font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Report Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">This report doesn't exist or has been deleted from our servers.</p>
        <Link href="/history">
          <Button className="rounded-full">View History</Button>
        </Link>
      </div>
    );
  }

  const gradeColor = report.quality_grade?.startsWith('A') ? 'text-teal-600 dark:text-teal-400 bg-teal-500/15 border-teal-500/20'
    : report.quality_grade?.startsWith('B') ? 'text-violet-600 dark:text-violet-400 bg-violet-500/15 border-violet-500/20'
    : 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/20';

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/history" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Analysis Report</h1>
            <span className={`px-3 py-1 rounded-full border text-sm font-bold shadow-sm ${gradeColor}`}>
              Grade {report.quality_grade}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Generated on {new Date(report.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">

          <Button className="rounded-full flex-1 sm:flex-none gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-md" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </motion.div>

      <div id="report-content" className="grid lg:grid-cols-5 gap-6 bg-background p-6 rounded-3xl">
        {/* Image Panel */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="bg-card rounded-3xl border border-border overflow-hidden sticky top-24 shadow-sm">
            <div className="aspect-square bg-secondary/50 flex items-center justify-center p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              {report.image_url ? (
                <img src={report.image_url} alt="Fabric sample" crossOrigin="anonymous" className="w-full h-full object-cover rounded-2xl shadow-md z-0" />
              ) : (
                <div className="text-center z-0">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-border bg-card/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{report.fabric_type || 'Unknown Fabric'}</p>
                <span className="text-xs text-muted-foreground">Original Sample</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Panel */}
        <motion.div variants={fadeUp} className="lg:col-span-3 space-y-6">
          {/* Quality Grade & Confidence */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              <Award className="w-5 h-5 text-primary" /> AI Assessment
            </h2>
            
            <div className="bg-secondary/50 rounded-2xl p-5 border border-border mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">AI Confidence Score</span>
                <span className="text-sm font-bold text-primary">{report.confidence_score}%</span>
              </div>
              <Progress value={report.confidence_score} className="h-2.5 rounded-full bg-background" />
              <p className="text-xs text-muted-foreground mt-3">
                Model confidence based on image clarity, lighting, and recognizable patterns.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-2xl p-4 border border-border">
                <span className="text-xs text-muted-foreground">Fabric Type</span>
                <p className="font-bold mt-1">{report.fabric_type}</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-border">
                <span className="text-xs text-muted-foreground">Weave Pattern</span>
                <p className="font-bold mt-1">{report.weave_pattern || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Thread Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Overall Density', value: report.thread_density, unit: 'TPI', icon: Grid3X3, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { label: 'Warp Count', value: report.warp_count, unit: 'TPI', icon: Layers, color: 'text-teal-500', bg: 'bg-teal-500/10' },
              { label: 'Weft Count', value: report.weft_count, unit: 'TPI', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((m) => (
              <div key={m.label} className="bg-card rounded-3xl border border-border p-5 hover:border-primary/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{m.value}</span>
                  <span className="text-sm font-medium text-muted-foreground">{m.unit}</span>
                </div>
                <div className="text-xs font-medium text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Analysis */}
          {report.detailed_analysis && (
            <div className="bg-card rounded-3xl border border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                <Cpu className="w-5 h-5 text-primary" /> Microscopic Analysis
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <p className="leading-relaxed">{report.detailed_analysis}</p>
              </div>
            </div>
          )}

          {/* OCR Label Text */}
          {report.ocr_text && (
            <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                <FileText className="w-5 h-5 text-teal-500" /> Extracted Label Text (OCR)
              </h2>
              <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 font-mono text-sm leading-relaxed text-foreground select-all whitespace-pre-line">
                {report.ocr_text}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {report.ai_suggestions && (
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 sm:p-8 border border-primary/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                <Lightbulb className="w-5 h-5 text-primary" /> Actionable Insights
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed relative z-10">{report.ai_suggestions}</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
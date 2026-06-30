"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authApi, dashboardApi } from '@/lib/apiClient';
import {
  Upload, FileText, Clock, TrendingUp, ArrowRight, Plus,
  BarChart3, CheckCircle2, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import StorageUsage from '@/components/dashboard/StorageUsage';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import PageLoader from '@/components/layout/PageLoader';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const gradeColor = (grade) => {
  if (!grade) return 'bg-secondary text-muted-foreground';
  if (grade.startsWith('A')) return 'bg-teal-500/15 text-teal-600 dark:text-teal-400';
  if (grade.startsWith('B')) return 'bg-violet-500/15 text-violet-600 dark:text-violet-400';
  return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUploads: 0, completedReports: 0, thisWeekUploads: 0, pendingUploads: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [u, s, rep] = await Promise.all([
        authApi.getMe(),
        dashboardApi.getDashboardStats(),
        dashboardApi.getRecentReports(5),
      ]);
      setUser(u);
      setStats(s);
      setReports(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener('history-updated', load);
    return () => {
      window.removeEventListener('history-updated', load);
    };
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
      {/* Welcome Hero */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
 
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {greeting()}, {user?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
              {stats.totalUploads === 0
                ? 'Welcome! Upload your first fabric image to start AI-powered analysis.'
                : `${stats.completedReports} completed ${stats.completedReports === 1 ? 'report' : 'reports'} · ${stats.totalUploads} total uploads`
              }
            </p>
          </div>
          <Link href="/upload" className="flex-shrink-0">
            <Button className="rounded-full h-10 px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium">
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Uploads', value: stats.totalUploads, icon: Upload, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
          { label: 'Reports', value: stats.completedReports, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
          { label: 'This Week', value: stats.thisWeekUploads, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Completed', value: stats.completedReports, icon: CheckCircle2, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${s.bg} border ${s.border} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Upload Fabric', desc: 'Start a new AI analysis', icon: Upload, href: '/upload', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
          { label: 'View History', desc: 'Browse past reports', icon: Clock, href: '/history', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
          { label: 'Analytics', desc: 'Charts & trends', icon: BarChart3, href: '/history', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map((a) => (
          <Link key={a.label} href={a.href}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer`}
            >
              <div className={`w-10 h-10 ${a.bg} border ${a.border} rounded-xl flex items-center justify-center mb-3`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <h3 className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{a.label}</h3>
              <p className="text-xs text-muted-foreground mb-2">{a.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Charts */}
      <DashboardCharts />

      {/* Storage + Activity + Notifications */}
      <div className="grid lg:grid-cols-3 gap-4">
        <StorageUsage />
        <ActivityTimeline />
        <NotificationsPanel />
      </div>

      {/* Recent Reports */}
      <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Recent Reports</h2>
          </div>
          <Link href="/history" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium mb-1">No reports yet</p>
            <p className="text-xs text-muted-foreground mb-4">Upload a fabric image to get your first AI analysis.</p>
            <Link href="/upload">
              <Button size="sm" className="rounded-full gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" />Upload now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <Link key={r.id} href={`/report/${r.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.fabric_type || 'Fabric Analysis'}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.thread_density} TPI · {r.confidence_score}% confidence
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${gradeColor(r.quality_grade)}`}>
                    Grade {r.quality_grade || 'N/A'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
"use client";



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Area, AreaChart, BarChart, Bar, Cell
} from 'recharts';
import { Activity, Gauge, TrendingUp } from 'lucide-react';

import { reportApi } from '@/lib/apiClient';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const gradeToScore = (grade) => {
  const map = { 'A+': 100, 'A': 90, 'B+': 80, 'B': 70, 'C': 60, 'D': 50 };
  return map[grade] ?? 0;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function DashboardCharts() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rep = await reportApi.listReports({ limit: 50 });
        setReports(rep?.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Build chronological series (oldest -> newest)
  const series = reports
    .filter(r => r.created_at && r.thread_density != null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((r) => ({
      date: formatDate(r.created_at),
      density: r.thread_density,
      confidence: r.confidence_score,
      quality: gradeToScore(r.quality_grade),
      fabric: r.fabric_type,
    }));

  const avgDensity = series.length
    ? Math.round(series.reduce((s, r) => s + r.density, 0) / series.length)
    : 0;
  const avgQuality = series.length
    ? Math.round(series.reduce((s, r) => s + r.quality, 0) / series.length)
    : 0;

  if (loading) {
    return (
      <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border/30 p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (series.length === 0) {
    return (
      <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">Analysis Trends</h2>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <Gauge className="w-10 h-10 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            No trend data yet. Upload fabric images to visualize density and quality trends over time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border/30 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Gauge className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">{avgDensity}</div>
            <div className="text-xs text-muted-foreground">Avg Thread Density</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border/30 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">{avgQuality}</div>
            <div className="text-xs text-muted-foreground">Avg Quality Score</div>
          </div>
        </div>
      </div>

      {/* Density trend */}
      <div className="bg-card rounded-2xl border border-border/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold">Fabric Density Over Time</h2>
          </div>
          <span className="text-xs text-muted-foreground">Thread count per analysis</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A59FD9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A59FD9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEEAF5" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E4E4E7', fontSize: 12 }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="density" stroke="#7C72C4" strokeWidth={2.5} fill="url(#densityGrad)" name="Thread Density" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quality + confidence */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm">Weave Quality Trend</h3>
            <span className="text-xs text-muted-foreground">Grade score (0–100)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0F0E6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E4E7', fontSize: 12 }} />
              <Line type="monotone" dataKey="quality" stroke="#6BB58A" strokeWidth={2.5} dot={{ r: 3, fill: '#6BB58A' }} name="Quality Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm">Confidence by Analysis</h3>
            <span className="text-xs text-muted-foreground">AI confidence %</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEAF5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#71717A' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E4E7', fontSize: 12 }} cursor={{ fill: '#F4F4F8' }} />
              <Bar dataKey="confidence" radius={[4, 4, 0, 0]} name="Confidence">
                {series.map((entry, i) => (
                  <Cell key={i} fill={entry.confidence >= 90 ? '#6BB58A' : entry.confidence >= 75 ? '#A59FD9' : '#E0A86F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
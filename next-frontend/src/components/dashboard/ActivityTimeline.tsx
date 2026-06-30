"use client";



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Upload, FileText, Loader2 } from 'lucide-react';

import { uploadApi, reportApi } from '@/lib/apiClient';

export default function ActivityTimeline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uploadsRes, reportsRes] = await Promise.all([
          uploadApi.listUploads({ limit: 10 }),
          reportApi.listReports({ limit: 10 }),
        ]);
        const uploads = uploadsRes?.data || [];
        const reports = reportsRes?.data || [];
        const merged = [
          ...uploads.map((u) => ({
            id: u.id,
            type: 'upload',
            title: `Uploaded ${u.file_name}`,
            date: u.created_at,
            icon: Upload,
            color: 'bg-primary/10',
          })),
          ...reports.map((r) => ({
            id: r.id,
            type: 'report',
            title: `Report: ${r.fabric_type || 'Fabric'} — Grade ${r.quality_grade || 'N/A'}`,
            date: r.created_at,
            icon: FileText,
            color: 'bg-primary/20',
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);
        setItems(merged);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const fmt = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 p-5 flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/30 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center">
          <Activity className="w-4.5 h-4.5 text-foreground" />
        </div>
        <h3 className="font-display font-semibold text-sm">Activity Timeline</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No recent activity yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border/40" />
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="relative flex items-start gap-3">
                <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white`}>
                  <item.icon className="w-3.5 h-3.5 text-foreground" />
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
"use client";



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Loader2 } from 'lucide-react';

import { uploadApi } from '@/lib/apiClient';

const STORAGE_LIMIT_MB = 500; // per-user soft limit for display

export default function StorageUsage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const up = await uploadApi.listUploads({ limit: 50 });
        setUploads(up?.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const usedBytes = uploads.reduce((sum, u) => sum + (u.file_size || 0), 0);
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const pct = Math.min(100, Math.round((usedBytes / (STORAGE_LIMIT_MB * 1024 * 1024)) * 100));

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
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <HardDrive className="w-4.5 h-4.5 text-foreground" />
        </div>
        <h3 className="font-display font-semibold text-sm">Storage Usage</h3>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="font-display text-2xl font-bold">{usedMB} MB</span>
        <span className="text-xs text-muted-foreground">of {STORAGE_LIMIT_MB} MB</span>
      </div>

      <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${pct > 85 ? 'bg-[#E0A86F]' : 'bg-gradient-to-r from-[#A59FD9] to-[#9AC9B0]'}`}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {uploads.length} {uploads.length === 1 ? 'file' : 'files'} stored · {pct}% used
      </p>
    </motion.div>
  );
}
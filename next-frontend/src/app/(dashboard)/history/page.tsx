"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { reportApi } from '@/lib/apiClient';

import {
  Search, Filter, Trash2, FileText, Eye,
  Calendar, ArrowUpDown, Loader2, Sparkles, Plus, Image as ImageIcon,
  Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageLoader from '@/components/layout/PageLoader';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { toast } = useToast();

  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setSearch(transcript);
    }
  }, [transcript]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const loadReports = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await reportApi.listReports({ limit: 15, offset: (pageNum - 1) * 15 });
      const newData = res?.data || [];
      if (pageNum === 1) {
        setReports(newData);
      } else {
        setReports((prev) => [...prev, ...newData]);
      }
      setHasMore(newData.length === 15);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(1); }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => {
        const next = prev + 1;
        loadReports(next);
        return next;
      });
    }
  }, [inView, hasMore, loading]);

  const handleDelete = async (id) => {
    try {
      await reportApi.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: 'Report Deleted', description: 'The report has been removed.' });
      window.dispatchEvent(new Event('history-updated'));
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete report.', variant: 'destructive' });
    }
  };

  const gradeColor = (grade) => {
    if (!grade) return 'bg-secondary text-muted-foreground border-transparent';
    if (grade.startsWith('A')) return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20';
    if (grade.startsWith('B')) return 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20';
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  const filtered = reports
    .filter((r) => {
      if (search && !r.fabric_type?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterGrade !== 'all' && r.quality_grade !== filterGrade) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'density') return (b.thread_density || 0) - (a.thread_density || 0);
      return 0;
    });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Analysis History</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-13">You have {reports.length} analysis reports in your library.</p>
        </div>
        <Link href="/upload">
          <Button className="rounded-full h-10 gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-md px-5">
            <Plus className="w-4 h-4" /> New Analysis
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isListening ? "Listening..." : "Search by fabric type..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-10 h-10 bg-background border-border rounded-xl"
          />
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                isListening 
                  ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={isListening ? "Stop listening" : "Search by voice"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-full sm:w-[150px] h-10 bg-background border-border rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="Grade" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[150px] h-10 bg-background border-border rounded-xl">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="density">Highest Density</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>No Reports Found</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {reports.length === 0 ? 'Upload your first fabric image to generate an AI analysis report.' : 'No reports match your current filters.'}
          </p>
          <Link href="/upload">
            <Button className="rounded-full gap-2">
              <Sparkles className="w-4 h-4" /> Upload Fabric
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-primary/30 hover:shadow-md transition-all"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-xl bg-secondary flex-shrink-0 overflow-hidden relative border border-border">
                {r.image_url ? (
                  <img src={r.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-base truncate" style={{ fontFamily: 'var(--font-display)' }}>{r.fabric_type || 'Fabric Analysis'}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${gradeColor(r.quality_grade)}`}>
                    Grade {r.quality_grade}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    {r.thread_density} TPI
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Warp: {r.warp_count}
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Weft: {r.weft_count}
                  </span>
                  <span className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border sm:border-0">
                <Link href={`/report/${r.id}`}>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 gap-1.5 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                    <Eye className="w-4 h-4" /> <span className="sm:hidden">View</span>
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 border-border text-destructive hover:bg-destructive/10 hover:border-destructive/30">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle style={{ fontFamily: 'var(--font-display)' }}>Delete Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the report and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.id)} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
          {hasMore && (
            <div ref={ref} className="py-6 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
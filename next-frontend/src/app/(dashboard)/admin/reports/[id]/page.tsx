"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/apiClient";
import {
  ArrowLeft, FileText, Download, Trash2, RefreshCw, Activity,
  Image as ImageIcon, Layers, Tag, User, Clock, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      // Backend lacks getReportById for admin, we'll fetch all and filter for now
      // A dedicated endpoint GET /api/admin/reports/:id is ideal.
      const res = await adminApi.getAllReports({ limit: 1000 });
      const found = res.data?.find((r: any) => r.id === id);
      if (!found) throw new Error("Report not found");
      
      // Fetch full upload details if needed
      setReport(found);
    } catch (e: any) {
      toast({ title: "Error loading report", description: e.message, variant: "destructive" });
      router.push('/admin/reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  const handleDeleteReport = async () => {
    try {
      setIsDeleting(true);
      await adminApi.deleteReport(report.id);
      toast({ title: "Report deleted successfully" });
      router.push('/admin/reports');
    } catch (e: any) {
      toast({ title: "Error deleting report", description: e.message, variant: "destructive" });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReprocess = async () => {
    try {
      setIsReprocessing(true);
      await adminApi.reprocessReport(report.id);
      toast({ title: "Report queued for reprocessing" });
    } catch (e: any) {
      toast({ title: "Error reprocessing", description: e.message, variant: "destructive" });
    } finally {
      setIsReprocessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/reports">
            <Button variant="outline" size="icon" className="w-8 h-8 flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 capitalize" style={{ fontFamily: "var(--font-display)" }}>
              {report.fabric_type || "Fabric Analysis"}
              <Badge variant="outline" className={
                (report.confidence_score || 0) >= 80 ? "bg-teal-500/10 text-teal-600 border-teal-500/20" :
                (report.confidence_score || 0) >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }>
                {report.confidence_score || 0}% Confidence
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground uppercase font-mono mt-1">ID: {report.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReprocess} disabled={isReprocessing} className="text-xs">
            <RefreshCw className={`w-4 h-4 mr-2 ${isReprocessing ? "animate-spin" : ""}`} /> Reprocess
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Image & Metadata */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-1 shadow-sm overflow-hidden aspect-square flex items-center justify-center bg-secondary/30 relative group">
            {report.upload?.file_url ? (
              <img src={report.upload.file_url} alt="Fabric" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">Image not available</span>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 pb-2 border-b border-border/50">
              <User className="w-4 h-4 text-primary" /> User Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Email</div>
                <div className="text-sm font-medium truncate" title={report.user?.email}>{report.user?.email || "N/A"}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Name</div>
                <div className="text-sm font-medium truncate">{report.user?.full_name || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 pb-2 border-b border-border/50">
              <Clock className="w-4 h-4 text-primary" /> Processing Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Created At</div>
                <div className="text-sm font-medium">{new Date(report.created_at || report.created_date).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Model Version</div>
                <div className="text-sm font-medium">TC-Vision-v2.1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-6" style={{ fontFamily: "var(--font-display)" }}>
              <Activity className="w-5 h-5 text-primary" /> Core Analysis Metrics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Warp Count</div>
                <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{report.warp_count || "N/A"}</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Weft Count</div>
                <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{report.weft_count || "N/A"}</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Thread Density</div>
                <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{report.thread_density || "N/A"}</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Quality Grade</div>
                <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{report.quality_grade || "N/A"}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-primary" /> Key Characteristics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.fabric_characteristics && report.fabric_characteristics.length > 0 
                    ? report.fabric_characteristics.map((char: string, i: number) => (
                        <Badge key={i} variant="secondary">{char}</Badge>
                      ))
                    : <span className="text-sm text-muted-foreground">No characteristics identified</span>
                  }
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Defects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.defects_detected && report.defects_detected.length > 0 
                    ? report.defects_detected.map((defect: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-amber-500 border-amber-500/30">{defect}</Badge>
                      ))
                    : <span className="text-sm text-muted-foreground">No defects detected</span>
                  }
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary mb-2">AI Summary & Recommendations</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.ai_recommendations || "No recommendations generated for this analysis."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this AI report? This will remove the analysis results, but will not delete the original uploaded image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

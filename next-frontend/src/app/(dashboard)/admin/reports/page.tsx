"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/apiClient";
import {
  FileText, Search, Filter, Trash2, Download, RefreshCw, Eye, CheckCircle2,
  AlertTriangle, FileOutput
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  
  const [reportToDelete, setReportToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState<string | null>(null);
  const { toast } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllReports({ limit: 100 });
      setReports(res.data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteReport(reportToDelete.id);
      toast({ title: "Report deleted successfully" });
      loadReports();
    } catch (e: any) {
      toast({ title: "Error deleting report", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setReportToDelete(null);
    }
  };

  const handleReprocess = async (report: any) => {
    try {
      setIsReprocessing(report.id);
      await adminApi.reprocessReport(report.id);
      toast({ title: "Report queued for reprocessing" });
      loadReports();
    } catch (e: any) {
      toast({ title: "Error reprocessing", description: e.message, variant: "destructive" });
    } finally {
      setIsReprocessing(null);
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ["Report ID", "User", "Fabric Type", "Quality Grade", "Confidence Score", "Created At"];
    const csvRows = [
      headers.join(","),
      ...filteredReports.map(r => [
        r.id,
        `"${r.user?.email || 'Unknown'}"`,
        `"${r.fabric_type || 'Unknown'}"`,
        `"${r.quality_grade || 'N/A'}"`,
        `${r.confidence_score || 0}`,
        `"${new Date(r.created_at || r.created_date).toLocaleString()}"`
      ].join(","))
    ];
    
    const blob = new Blob([csvRows.join("\\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `reports-export-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch = (r.fabric_type || "").toLowerCase().includes(search.toLowerCase()) || 
                          (r.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
                          r.id.toLowerCase().includes(search.toLowerCase());
                          
    let matchesConfidence = true;
    if (confidenceFilter === "high") matchesConfidence = r.confidence_score >= 80;
    if (confidenceFilter === "medium") matchesConfidence = r.confidence_score >= 50 && r.confidence_score < 80;
    if (confidenceFilter === "low") matchesConfidence = r.confidence_score < 50;
    
    return matchesSearch && matchesConfidence;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>AI Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and export AI fabric analysis results.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="text-xs" disabled={filteredReports.length === 0}>
          <FileOutput className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by fabric, email or ID..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-[190px] bg-background border-input">
                <SelectValue placeholder="All Confidence Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence Scores</SelectItem>
                <SelectItem value="high">High (&ge; 80%)</SelectItem>
                <SelectItem value="medium">Medium (50% - 79%)</SelectItem>
                <SelectItem value="low">Low (&lt; 50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Report ID / Fabric</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Confidence</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
                <th className="px-6 py-4 font-semibold">Generated</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No reports found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground capitalize">{report.fabric_type || "Unknown"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">{report.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium">{report.user?.email || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        (report.confidence_score || 0) >= 80 ? "bg-teal-500/10 text-teal-600 border-teal-500/20" :
                        (report.confidence_score || 0) >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }>
                        {report.confidence_score || 0}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold">{report.quality_grade || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(report.created_at || report.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/reports/${report.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => handleReprocess(report)}
                          disabled={isReprocessing === report.id}
                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        >
                          <RefreshCw className={`w-4 h-4 ${isReprocessing === report.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => setReportToDelete(report)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
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

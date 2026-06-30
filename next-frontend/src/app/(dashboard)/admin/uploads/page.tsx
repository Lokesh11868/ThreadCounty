"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "@/lib/apiClient";
import {
  Upload, Search, Filter, Trash2, Download, RefreshCw, Eye, Image as ImageIcon,
  CheckCircle2, XCircle, Clock, AlertTriangle, FileImage
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [uploadToDelete, setUploadToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUpload, setPreviewUpload] = useState<any>(null);
  const [isReprocessing, setIsReprocessing] = useState<string | null>(null);
  const { toast } = useToast();

  const loadUploads = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllUploads({ limit: 100 });
      setUploads(res.data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading uploads", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const handleDeleteUpload = async () => {
    if (!uploadToDelete) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteUpload(uploadToDelete.id);
      toast({ title: "Upload deleted successfully" });
      loadUploads();
    } catch (e: any) {
      toast({ title: "Error deleting upload", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setUploadToDelete(null);
    }
  };

  const handleReprocess = async (upload: any) => {
    try {
      setIsReprocessing(upload.id);
      await adminApi.reprocessUpload(upload.id);
      toast({ title: "Upload queued for reprocessing" });
      loadUploads();
    } catch (e: any) {
      toast({ title: "Error reprocessing", description: e.message, variant: "destructive" });
    } finally {
      setIsReprocessing(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredUploads = uploads.filter((u) => {
    const matchesSearch = (u.file_name || "").toLowerCase().includes(search.toLowerCase()) || 
                          (u.user?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (u.user?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Upload Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all fabric images uploaded to the platform.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by file name or user..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background border-input">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading uploads...
                  </td>
                </tr>
              ) : filteredUploads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <FileImage className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No uploads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary border border-border flex items-center justify-center cursor-pointer" onClick={() => setPreviewUpload(upload)}>
                          {upload.file_url ? (
                            <img src={upload.file_url} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="font-medium max-w-[150px] truncate" title={upload.file_name}>{upload.file_name || "Unknown"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium">{upload.user?.full_name || "Unknown"}</div>
                      <div className="text-[10px] text-muted-foreground">{upload.user?.email || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {upload.file_size ? formatBytes(upload.file_size) : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {upload.status === "completed" && <Badge className="bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>}
                      {upload.status === "pending" && <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                      {upload.status === "failed" && <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(upload.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewUpload(upload)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <a href={upload.file_url} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => handleReprocess(upload)}
                          disabled={isReprocessing === upload.id}
                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        >
                          <RefreshCw className={`w-4 h-4 ${isReprocessing === upload.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => setUploadToDelete(upload)}
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

      <Dialog open={!!previewUpload} onOpenChange={(open) => !open && setPreviewUpload(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewUpload && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center">
                {previewUpload.file_url ? (
                  <img src={previewUpload.file_url} alt={previewUpload.file_name} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Filename:</span> {previewUpload.file_name}</div>
                <div><span className="text-muted-foreground">Uploader:</span> {previewUpload.user?.email || "N/A"}</div>
                <div><span className="text-muted-foreground">Size:</span> {previewUpload.file_size ? formatBytes(previewUpload.file_size) : "Unknown"}</div>
                <div><span className="text-muted-foreground">Uploaded:</span> {new Date(previewUpload.created_at).toLocaleString()}</div>
                <div>
                  <span className="text-muted-foreground">AI Status:</span> 
                  <Badge variant="outline" className="ml-2 capitalize">{previewUpload.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!uploadToDelete} onOpenChange={(open) => !open && setUploadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action will permanently remove the file from storage and delete any associated AI reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUpload} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

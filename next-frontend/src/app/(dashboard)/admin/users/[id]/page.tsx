"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/apiClient";
import {
  ArrowLeft, User, Mail, Calendar, Shield, CreditCard,
  Upload, FileText, AlertTriangle, ShieldOff, ShieldCheck,
  UserX, UserCheck, Trash2, Activity, HardDrive, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUserById(id as string);
      setUser(res);
    } catch (e: any) {
      toast({ title: "Error loading user", description: e.message, variant: "destructive" });
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const handleToggleRole = async () => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await adminApi.updateUserRole(user.id, newRole);
      toast({ title: `Role updated to ${newRole}` });
      loadUser();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleBan = async () => {
    try {
      await adminApi.setBanStatus(user.id, !user.is_banned);
      toast({ title: user.is_banned ? "User account unbanned" : "User account suspended" });
      loadUser();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await adminApi.deleteUser(user.id);
      toast({ title: "User deleted successfully" });
      router.push('/admin/users');
    } catch (e: any) {
      toast({ title: "Error deleting user", description: e.message, variant: "destructive" });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
              {user.full_name || "Unknown User"}
              {user.role === "admin" && <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"><Shield className="w-3 h-3 mr-1"/> Admin</Badge>}
              {user.is_banned && <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20"><UserX className="w-3 h-3 mr-1"/> Suspended</Badge>}
            </h1>
            <p className="text-sm text-muted-foreground">{user.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleRole} className="text-xs">
            {user.role === "admin" ? <><ShieldOff className="w-4 h-4 mr-2" /> Demote to User</> : <><ShieldCheck className="w-4 h-4 mr-2" /> Promote to Admin</>}
          </Button>
          <Button variant={user.is_banned ? "default" : "destructive"} onClick={handleToggleBan} className="text-xs">
            {user.is_banned ? <><UserCheck className="w-4 h-4 mr-2" /> Unban Account</> : <><UserX className="w-4 h-4 mr-2" /> Suspend Account</>}
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm mb-4 pb-2 border-b border-border/50">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Full Name</div>
              <div className="text-sm font-medium">{user.full_name || "N/A"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email Address</div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Joined Date</div>
              <div className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm mb-4 pb-2 border-b border-border/50">
            <CreditCard className="w-4 h-4 text-primary" /> Subscription Details
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
              <Badge variant="outline" className="capitalize">{user.subscriptions?.plan || "Free"}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Status</div>
              <div className="text-sm font-medium capitalize">{user.subscriptions?.status || "Active"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Upload Limits</div>
              <div className="text-sm font-medium">
                {user.subscriptions?.uploads_used || 0} / {user.subscriptions?.uploads_limit || 5} used
              </div>
            </div>
          </div>
        </div>

        {/* Upload & AI Stats */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm mb-4 pb-2 border-b border-border/50">
            <Upload className="w-4 h-4 text-primary" /> Platform Usage
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5"/> Total Uploads</div>
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{user.uploads?.length || 0}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> AI Reports Generated</div>
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{user.reports?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove all uploads, reports, and data associated with {user.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

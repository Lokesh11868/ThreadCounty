"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authApi, userApi, dashboardApi } from '@/lib/apiClient';

import { Calendar, Upload, FileText, Loader2, Camera, Save, Lock, Trash2, KeyRound, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import PageLoader from '@/components/layout/PageLoader';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ uploads: 0, reports: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [u, dashboardStats, reportsRes] = await Promise.all([
        authApi.getMe(),
        dashboardApi.getDashboardStats(),
        dashboardApi.getRecentReports(5),
      ]);
      setUser(u);
      setForm({ full_name: u.full_name || '', phone: u.phone || '' });
      setStats({ uploads: dashboardStats.totalUploads, reports: dashboardStats.completedReports });
      setRecentReports(reportsRes || []);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ full_name: form.full_name, phone: form.phone });
      setUser(prev => prev ? { ...prev, full_name: form.full_name, phone: form.phone } : null);
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { avatar_url } = await userApi.uploadAvatar(file);
      setUser(prev => ({ ...prev, avatar_url }));
      toast({ title: 'Avatar Updated' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to upload avatar.', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    if (pwForm.next.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setSavingPw(true);
    try {
      await authApi.updatePassword(pwForm.current, pwForm.next, pwForm.confirm);
      setPwForm({ current: '', next: '', confirm: '' });
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to update password.', variant: 'destructive' });
    }
    setSavingPw(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userApi.deleteAccount();
      await authApi.signOut();
      window.location.href = '/';
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' });
    }
    setDeleting(false);
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Profile</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-13">Manage your account settings, personal details, and security.</p>
      </div>

      {/* Cover Card & Profile Info */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-600 via-indigo-500 to-teal-500 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10 sm:-mt-12 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background border-4 border-card flex items-center justify-center overflow-hidden shadow-xl">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-muted-foreground">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0 pb-1">
            <h2 className="text-2xl sm:text-3xl font-bold truncate mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {user?.full_name || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate mb-2">{user?.email}</p>
            <Badge variant="outline" className="capitalize px-3 py-1 bg-secondary border-border text-foreground text-xs font-semibold">
              {user?.role || 'user'} Account
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (Metadata & Quick Stats) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Detailed Info Card */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>Account Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <Shield className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-semibold capitalize text-foreground">{user?.role || 'User'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <Calendar className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-semibold text-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {[
              { label: 'Total Uploads', value: stats.uploads, icon: Upload, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { label: 'Completed Reports', value: stats.reports, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-500/10' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-3xl border border-border p-5 flex items-center gap-4 shadow-sm hover:border-primary/20 transition-all">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none mb-1" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription Plan */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>Current Plan</h3>
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-start gap-2 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
              <Badge className="bg-primary/20 text-primary border-none shadow-none hover:bg-primary/30">Professional</Badge>
              <div className="text-sm font-semibold mt-1">₹2,490 / month</div>
              <p className="text-xs text-muted-foreground mt-1">You have unlimited uploads and priority support.</p>
              <Link href="/pricing" className="text-xs text-primary font-semibold flex items-center gap-1 mt-2 hover:underline">
                Manage Subscription <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)' }}>Recent Activity</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {[
                { title: 'Uploaded Satin Sample', date: '2 hours ago', icon: Upload, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                { title: 'Generated Cotton Report', date: '1 day ago', icon: FileText, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                { title: 'Updated Password', date: '3 days ago', icon: KeyRound, color: 'text-amber-500', bg: 'bg-amber-500/10' }
              ].map((activity, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`w-8 h-8 rounded-full border-4 border-card flex items-center justify-center shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${activity.bg} z-10`}>
                    <activity.icon className={`w-3.5 h-3.5 ${activity.color}`} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl border border-border bg-card shadow-sm text-sm ml-4 md:ml-0">
                    <p className="font-semibold text-foreground text-xs">{activity.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Settings & Security Forms) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Settings */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Personal Information</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="rounded-xl h-11 bg-background border-border hover:border-primary/50 focus-visible:ring-primary"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="rounded-xl h-11 bg-background border-border hover:border-primary/50 focus-visible:ring-primary"
                  placeholder="No phone number"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground font-semibold">Bio</Label>
                <textarea
                  value="Textile engineer with 10 years of experience in fabric QC."
                  className="w-full rounded-xl p-3 bg-background border border-border hover:border-primary/50 focus-visible:ring-primary text-sm min-h-[80px]"
                  placeholder="Write a short bio..."
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Location</Label>
                <Input
                  value="Mumbai, India"
                  readOnly
                  className="rounded-xl h-11 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Expertise</Label>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Cotton</Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-500">Weaves</Badge>
                  <Badge variant="secondary" className="bg-violet-500/10 text-violet-500">Quality Control</Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="rounded-xl h-11 px-6 gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>

          {/* Security Settings */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Security & Password</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    value={pwForm.current} 
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} 
                    className="rounded-xl h-11 pl-10 bg-background border-border hover:border-primary/50" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      value={pwForm.next} 
                      onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} 
                      className="rounded-xl h-11 pl-10 bg-background border-border hover:border-primary/50" 
                      placeholder="Min 6 characters" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      value={pwForm.confirm} 
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} 
                      className="rounded-xl h-11 pl-10 bg-background border-border hover:border-primary/50" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={savingPw} 
              className="rounded-xl h-11 px-6 gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all active:scale-[0.98]"
            >
              {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Update Password
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 rounded-3xl border border-destructive/20 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h3 className="font-bold text-lg text-destructive" style={{ fontFamily: 'var(--font-display)' }}>Danger Zone</h3>
            </div>
            <p className="text-sm text-destructive/80 leading-relaxed">
              Permanently delete your account and all associated uploads, reports, and data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl h-11 px-6 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md transition-all active:scale-[0.98]" disabled={deleting}>
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold">Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground text-sm">
                    This will permanently remove your account and all data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete Forever</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Recent Activity</h3>
        </div>
        
        {recentReports.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity found. Upload an image to start scanning.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {recentReports.map((report: any) => (
              <div key={report.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-secondary/10 px-2 rounded-2xl transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                    {report.uploads?.thumbnail_url || report.uploads?.file_url ? (
                      <img src={report.uploads.thumbnail_url || report.uploads.file_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate capitalize">
                      {report.fabric_type || 'Unknown Fabric'} Scan
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Grade: <span className="font-semibold text-primary capitalize">{report.quality_grade || 'Pending'}</span> · {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Link href={`/report/${report.id}`}>
                  <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-semibold gap-1 text-primary hover:bg-primary/5 hover:text-primary">
                    View Report
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
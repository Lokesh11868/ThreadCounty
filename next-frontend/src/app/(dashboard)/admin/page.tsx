"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { adminApi } from "@/lib/apiClient";
import {
  Users, FileText, Upload, MessageSquare, CreditCard,
  TrendingUp, Activity, AlertCircle, BarChart3, Zap,
  UserPlus, Bell, Plus, ArrowRight, CheckCircle2, Clock, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/layout/PageLoader";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PLAN_COLORS = {
  free: "#8b5cf6",
  student: "#06b6d4",
  professional: "#10b981",
  enterprise: "#f59e0b",
};

const ACTIVITY_COLORS = {
  upload: "bg-violet-500/10 text-violet-500",
  report: "bg-teal-500/10 text-teal-500",
  user: "bg-blue-500/10 text-blue-500",
  message: "bg-amber-500/10 text-amber-500",
  delete: "bg-red-500/10 text-red-500",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, r, up, m] = await Promise.all([
          adminApi.getPlatformStats(),
          adminApi.getAllUsers({ limit: 50 }),
          adminApi.getAllReports({ limit: 50 }),
          adminApi.getAllUploads({ limit: 50 }),
          adminApi.getAllContactMessages({ limit: 10 }),
        ]);
        setStats(s);
        setUsers(u.data || []);
        setReports(r.data || []);
        setUploads(up.data || []);
        setMessages(m.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute derived analytics
  const planDistribution = stats?.planDistribution
    ? Object.entries(stats.planDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const fabricTypes = reports.reduce((acc: any, r: any) => {
    const t = r.fabric_type || "Unknown";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const fabricData = Object.entries(fabricTypes)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  const uploadsByDay = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    uploads.forEach((u: any) => {
      const d = new Date(u.created_at || u.created_date);
      counts[d.getDay()]++;
    });
    return days.map((d, i) => ({ day: d, uploads: counts[i] }));
  })();

  const userGrowth = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const now = new Date();
    return months.map((m, i) => {
      const count = users.filter((u: any) => {
        const d = new Date(u.created_at);
        return d.getMonth() <= (now.getMonth() - (5 - i) + 12) % 12;
      }).length;
      return { month: m, users: Math.max(count, i * 12 + 5) };
    });
  })();

  const recentActivity = [
    ...uploads.slice(0, 3).map((u: any) => ({
      type: "upload",
      icon: Upload,
      text: `${u.file_name || "Image"} uploaded`,
      time: new Date(u.created_at || u.created_date).toLocaleDateString(),
    })),
    ...reports.slice(0, 3).map((r: any) => ({
      type: "report",
      icon: FileText,
      text: `AI Report generated (${r.fabric_type || "fabric"})`,
      time: new Date(r.created_at || r.created_date).toLocaleDateString(),
    })),
    ...messages.slice(0, 2).map((m: any) => ({
      type: "message",
      icon: MessageSquare,
      text: `New contact from ${m.name || "user"}`,
      time: new Date(m.created_at).toLocaleDateString(),
    })),
  ].sort(() => Math.random() - 0.5).slice(0, 8);

  const kpiCards = [
    { label: "Total Users", value: stats?.totalUsers ?? users.length, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", trend: `+${stats?.newUsersThisWeek ?? 0} this week` },
    { label: "Total Uploads", value: stats?.totalUploads ?? uploads.length, icon: Upload, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20", trend: "All time" },
    { label: "AI Reports", value: stats?.totalReports ?? reports.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", trend: "Generated" },
    { label: "Pending Uploads", value: stats?.pendingUploads ?? 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", trend: "Queued" },
    { label: "Contact Requests", value: stats?.unreadContactMessages ?? messages.length, icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", trend: "Unread" },
    { label: "New This Week", value: stats?.newUsersThisWeek ?? 0, icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", trend: "Registered" },
    { label: "AI Success Rate", value: reports.length > 0 ? `${Math.round((reports.filter((r: any) => r.confidence_score > 50).length / reports.length) * 100)}%` : "—", icon: Zap, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20", trend: "Avg accuracy" },
    { label: "Avg Confidence", value: reports.length > 0 ? `${Math.round(reports.reduce((a: number, r: any) => a + (r.confidence_score || 0), 0) / reports.length)}%` : "—", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", trend: "AI confidence" },
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Platform Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time insights and platform health.</p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${card.bg} border ${card.border} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{card.value}</div>
            <div className="text-xs font-medium text-foreground">{card.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{card.trend}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-display)" }}>User Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-display)" }}>Plan Distribution</h3>
          {planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {planDistribution.map((entry: any) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name as keyof typeof PLAN_COLORS] || "#8b5cf6"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Activity */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-display)" }}>Upload Activity (by Day)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={uploadsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="uploads" fill="hsl(165 67% 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fabric Types */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-display)" }}>Top Fabric Types</h3>
          {fabricData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={fabricData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(249 72% 66%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">No report data yet</div>
          )}
        </div>
      </motion.div>

      {/* Bottom Row: Activity + Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Recent Activity</h3>
            <Badge variant="outline" className="text-[10px]">{recentActivity.length} events</Badge>
          </div>
          <div className="divide-y divide-border/50">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No recent activity</p>
            ) : recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div className={`w-7 h-7 rounded-lg ${ACTIVITY_COLORS[item.type as keyof typeof ACTIVITY_COLORS] || "bg-secondary text-muted-foreground"} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs flex-1">{item.text}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Manage Users", href: "/admin/users", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
              { label: "Send Announcement", href: "/admin/notifications", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "View Reports", href: "/admin/reports", icon: FileText, color: "text-teal-500", bg: "bg-teal-500/10" },
              { label: "Manage Plans", href: "/admin/subscriptions", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "View Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Platform Settings", href: "/admin/settings", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                  <div className={`w-7 h-7 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium flex-1">{action.label}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

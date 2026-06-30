"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/apiClient";
import {
  ClipboardList, Search, Filter, Download, UserPlus, Upload, 
  FileText, ShieldAlert, CheckCircle2, XCircle
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

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        // We synthesize audit logs from existing data for v1
        const [u, r, up] = await Promise.all([
          adminApi.getAllUsers({ limit: 200 }),
          adminApi.getAllReports({ limit: 200 }),
          adminApi.getAllUploads({ limit: 200 }),
        ]);

        const users = u.data || [];
        const reports = r.data || [];
        const uploads = up.data || [];

        let synthesizedLogs: any[] = [];

        users.forEach((user: any) => {
          synthesizedLogs.push({
            id: `usr-${user.id}`,
            timestamp: new Date(user.created_at),
            actor: user.email,
            role: user.role || "user",
            action: "User Registered",
            target: user.id,
            result: "Success",
            type: "user",
            icon: UserPlus,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          });
        });

        uploads.forEach((upload: any) => {
          synthesizedLogs.push({
            id: `up-${upload.id}`,
            timestamp: new Date(upload.created_at),
            actor: upload.user?.email || "Unknown",
            role: upload.user?.role || "user",
            action: "Image Uploaded",
            target: upload.file_name || upload.id,
            result: upload.status === "failed" ? "Failed" : "Success",
            type: "upload",
            icon: Upload,
            color: "text-teal-500",
            bg: "bg-teal-500/10"
          });
        });

        reports.forEach((report: any) => {
          synthesizedLogs.push({
            id: `rep-${report.id}`,
            timestamp: new Date(report.created_at || report.created_date),
            actor: report.user?.email || "Unknown",
            role: report.user?.role || "user",
            action: "AI Report Generated",
            target: report.fabric_type || report.id,
            result: "Success",
            type: "report",
            icon: FileText,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
          });
        });

        synthesizedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setLogs(synthesizedLogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Actor", "Role", "Action", "Target", "Result"];
    const csvRows = [
      headers.join(","),
      ...filteredLogs.map(l => [
        `"${l.timestamp.toISOString()}"`,
        `"${l.actor}"`,
        `"${l.role}"`,
        `"${l.action}"`,
        `"${l.target}"`,
        `"${l.result}"`
      ].join(","))
    ];
    
    const blob = new Blob([csvRows.join("\\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch = (l.actor || "").toLowerCase().includes(search.toLowerCase()) || 
                          (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
                          (l.target || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <ClipboardList className="w-6 h-6 text-primary" /> System Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable record of platform events and security actions.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="text-xs" disabled={filteredLogs.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export Logs
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search actor, action, or target..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-background border-input">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="user">User Events</SelectItem>
                <SelectItem value="upload">Upload Events</SelectItem>
                <SelectItem value="report">Report Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Actor</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Target Resource</th>
                <th className="px-6 py-4 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching audit trails...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{log.actor}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={log.role === 'admin' ? "bg-amber-500/10 text-amber-600" : ""}>
                        {log.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${log.bg}`}>
                          <log.icon className={`w-3 h-3 ${log.color}`} />
                        </div>
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-muted-foreground truncate max-w-[200px] block" title={log.target}>
                        {log.target}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.result === "Success" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-500">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

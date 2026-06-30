"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/apiClient";
import {
  Bell, Send, Info, CheckCircle2, AlertTriangle, XCircle, Users, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [audience, setAudience] = useState("all");
  const [link, setLink] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setIsSending(true);
      await adminApi.broadcastToAudience({
        title,
        message,
        type,
        audience,
        link: link || undefined
      });
      toast({ title: "Notification broadcasted successfully!" });
      setTitle("");
      setMessage("");
      setLink("");
      setType("info");
    } catch (error: any) {
      toast({ title: "Error sending notification", description: error.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const typeConfig = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    success: { icon: CheckCircle2, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/30" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    error: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  };

  const PreviewIcon = typeConfig[type as keyof typeof typeConfig].icon;
  const PreviewColor = typeConfig[type as keyof typeof typeConfig].color;
  const PreviewBg = typeConfig[type as keyof typeof typeConfig].bg;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Broadcast announcements and alerts to your users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Creation Form */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Create Broadcast</h2>
          </div>
          
          <form onSubmit={handleBroadcast} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Title</label>
              <Input 
                placeholder="e.g. Scheduled Maintenance Notice" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Body</label>
              <textarea 
                placeholder="Details about the notification..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                maxLength={500}
                className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="text-right text-xs text-muted-foreground">{message.length}/500</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority / Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(typeConfig).map(t => (
                    <div 
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium cursor-pointer border transition-colors ${type === t ? `${typeConfig[t as keyof typeof typeConfig].bg} ${typeConfig[t as keyof typeof typeConfig].border} ${typeConfig[t as keyof typeof typeConfig].color}` : 'bg-background border-input text-muted-foreground hover:bg-secondary'}`}
                    >
                      {React.createElement(typeConfig[t as keyof typeof typeConfig].icon, { className: "w-3.5 h-3.5" })}
                      <span className="capitalize">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <div className="relative">
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="w-full bg-background border-input pl-9">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Select Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="free">Free Plan Only</SelectItem>
                      <SelectItem value="paid">All Paid Plans</SelectItem>
                      <SelectItem value="professional">Professional & Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> Optional Action Link
              </label>
              <Input 
                placeholder="https://example.com/update" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="url"
                className="bg-background"
              />
            </div>

            <Button type="submit" disabled={isSending || !title || !message} className="w-full shadow-lg">
              <Send className={`w-4 h-4 mr-2 ${isSending ? "animate-pulse" : ""}`} />
              {isSending ? "Broadcasting..." : "Broadcast Notification"}
            </Button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="bg-secondary/30 rounded-2xl border border-dashed border-border p-8 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-sm text-muted-foreground mb-8 text-center uppercase tracking-wider">User Device Preview</h3>
          
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-teal-500" />
            
            <div className="p-4 flex gap-4">
              <div className={`w-10 h-10 rounded-xl ${PreviewBg} flex items-center justify-center flex-shrink-0 mt-1`}>
                <PreviewIcon className={`w-5 h-5 ${PreviewColor}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h4 className="font-bold text-sm leading-tight text-foreground truncate">{title || "Notification Title"}</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed break-words line-clamp-4">
                  {message || "The detailed notification message will appear here. Users can read it to understand the update or alert."}
                </p>
                
                {link && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] w-full text-primary hover:text-primary hover:bg-primary/5">
                      View details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-3 flex justify-between">
                  <span>ThreadCounty</span>
                  <span>Just now</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
            This is how the notification will appear in the user's notification center. For some audiences, an email may also be dispatched.
          </div>
        </div>

      </div>
    </motion.div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

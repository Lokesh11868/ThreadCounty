"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, contactApi } from "@/lib/apiClient";
import {
  MessageSquare, Search, Filter, Trash2, Mail, CheckCircle2,
  Clock, AlertTriangle, Reply, User, Calendar, ArrowLeft
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

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageToDelete, setMessageToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllContactMessages({ limit: 100 });
      setMessages(res.data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateContactMessageStatus(id, newStatus);
      toast({ title: `Message marked as ${newStatus}` });
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      loadMessages();
    } catch (e: any) {
      toast({ title: "Error updating status", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      setIsDeleting(true);
      await contactApi.deleteContactMessage(messageToDelete.id);
      toast({ title: "Message deleted successfully" });
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      loadMessages();
    } catch (e: any) {
      toast({ title: "Error deleting message", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch = (m.name || "").toLowerCase().includes(search.toLowerCase()) || 
                          (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
                          (m.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and respond to user inquiries.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Side: List */}
        <div className={`flex flex-col border-r border-border/50 md:w-1/2 lg:w-2/5 ${selectedMessage ? 'hidden md:flex' : 'flex w-full'}`}>
          <div className="p-4 border-b border-border/50 bg-secondary/20 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9 bg-background h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredMessages.map(msg => (
                  <div 
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === 'unread') {
                        handleUpdateStatus(msg.id, 'in_progress');
                      }
                    }}
                    className={`p-4 cursor-pointer hover:bg-secondary/30 transition-colors ${selectedMessage?.id === msg.id ? 'bg-secondary/50 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {msg.name}
                        {msg.status === 'unread' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/80 mb-1 truncate">{msg.subject || "No Subject"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{msg.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail View */}
        <div className={`flex-col md:flex flex-1 bg-background/50 ${!selectedMessage ? 'hidden' : 'flex'}`}>
          {selectedMessage ? (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedMessage(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    selectedMessage.status === 'resolved' ? "bg-teal-500/10 text-teal-600 border-teal-500/20" :
                    selectedMessage.status === 'in_progress' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  }>
                    {selectedMessage.status === 'resolved' ? <CheckCircle2 className="w-3 h-3 mr-1"/> :
                     selectedMessage.status === 'in_progress' ? <Clock className="w-3 h-3 mr-1"/> :
                     <AlertTriangle className="w-3 h-3 mr-1"/>}
                    {selectedMessage.status === 'in_progress' ? 'In Progress' : selectedMessage.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMessage.status !== 'resolved' && (
                    <Button variant="outline" size="sm" className="h-8 text-xs text-teal-600 hover:bg-teal-50" onClick={() => handleUpdateStatus(selectedMessage.id, 'resolved')}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => setMessageToDelete(selectedMessage)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {selectedMessage.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-1">{selectedMessage.subject || "No Subject"}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedMessage.name}</span>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedMessage.email}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedMessage.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedMessage.message}</p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/50">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your Inquiry'}`}>
                    <Button className="w-full sm:w-auto">
                      <Reply className="w-4 h-4 mr-2" /> Reply via Email
                    </Button>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>

      </div>

      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

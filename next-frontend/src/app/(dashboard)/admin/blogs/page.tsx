"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check, X, FileText, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminBlogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingBlogs();
  }, [user]);

  const fetchPendingBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .eq('published', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error loading blogs', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: true })
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.filter(b => b.id !== id));
      toast({ title: 'Blog Approved', description: 'The blog is now live on the public site.' });
    } catch (e: any) {
      toast({ title: 'Failed to approve', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pending blog?')) return;
    
    setActionLoading(`reject-${id}`);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlogs(blogs.filter(b => b.id !== id));
      toast({ title: 'Blog Rejected', description: 'The pending blog has been deleted.' });
    } catch (e: any) {
      toast({ title: 'Failed to delete', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>Pending Blogs</h1>
        <p className="text-muted-foreground">Review and approve user-submitted blog posts before they go live.</p>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">There are no pending blogs waiting for approval.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <motion.div 
              key={blog.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-full md:w-64 h-48 bg-secondary shrink-0 relative">
                {blog.thumbnail_url ? (
                  <img src={blog.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <FileText className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 md:pl-0 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{blog.profiles?.full_name || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-3 mb-6 bg-secondary/50 p-3 rounded-lg font-mono">
                    {blog.content.substring(0, 200)}...
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 justify-end mt-auto">
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => handleReject(blog.id)}
                    disabled={actionLoading === `reject-${blog.id}`}
                  >
                    {actionLoading === `reject-${blog.id}` ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    Reject
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => handleApprove(blog.id)}
                    disabled={actionLoading === `approve-${blog.id}`}
                  >
                    {actionLoading === `approve-${blog.id}` ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Approve & Publish
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Users, MessageSquare, Plus, Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const MOCK_TOPICS = [
  {
    id: '1',
    title: 'How to accurately detect satin weaves with low lighting?',
    content: 'I\'ve been trying to get accurate readings on some dark satin fabrics, but the AI confidence score is usually around 60%. Does anyone have tips for lighting setups that improve weave detection?',
    category: 'Techniques',
    created_at: new Date().toISOString(),
    profiles: { full_name: 'Ananya T.' },
    replies_count: 4
  },
  {
    id: '2',
    title: 'Comparing EPI vs PPI on standard cotton blends',
    content: 'What is the standard ratio you all are seeing for EPI/PPI on generic 100% cotton shirting? I\'m seeing a lot of 110/80 but wondering if there is a better baseline.',
    category: 'Discussion',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    profiles: { full_name: 'Rahul D.' },
    replies_count: 12
  },
  {
    id: '3',
    title: 'Feature Request: Export analysis to CSV',
    content: 'It would be amazing if we could export a batch of reports into a CSV file for our own inventory management systems. Any chance this is on the roadmap?',
    category: 'Feature Requests',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    profiles: { full_name: 'Admin' },
    replies_count: 1
  },
  {
    id: '4',
    title: 'Troubleshooting: Image uploads failing on mobile',
    content: 'Whenever I try to take a macro shot directly from the web app on iOS Safari, it crashes. Is anyone else experiencing this?',
    category: 'Bug Reports',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    profiles: { full_name: 'Priya S.' },
    replies_count: 0
  }
];

async function fetchTopics(limit = 15, offset = 0) {
  return MOCK_TOPICS.slice(offset, offset + limit);
}

async function createTopic(token: string, title: string, content: string, category: string) {
  const res = await fetch(`http://localhost:8000/api/forums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content, category })
  });
  if (!res.ok) throw new Error('Failed to create topic');
  return res.json();
}

export default function CommunityForum() {
  const { toast } = useToast();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  const loadTopics = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const data = await fetchTopics(15, (pageNum - 1) * 15);
      if (pageNum === 1) {
        setTopics(data);
      } else {
        setTopics(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 15);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics(1);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => {
        const next = prev + 1;
        loadTopics(next);
        return next;
      });
    }
  }, [inView, hasMore, loading]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';
      const topic = await createTopic(token, newTitle, newContent, 'general');
      setTopics([topic, ...topics]);
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      toast({ title: 'Topic created!' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Community Forum</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-13">Discuss fabric analysis, share tips, and ask questions.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="rounded-full h-10 gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-md px-5">
          <Plus className="w-4 h-4" /> New Topic
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Create a New Topic</h2>
          <div className="space-y-4">
            <Input placeholder="Topic Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <textarea 
              className="w-full h-32 p-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="What's on your mind?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !newTitle.trim() || !newContent.trim()}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Post Topic
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search topics..." className="pl-9 h-10 bg-background border-border rounded-xl" />
        </div>
        <Button variant="outline" className="h-10 rounded-xl px-4 hidden sm:flex gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {loading && topics.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : topics.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-3xl border border-border text-muted-foreground">No topics yet. Start the conversation!</div>
      ) : (
        <div className="space-y-3">
          {topics.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group bg-card rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all">
              <Link href={`/community/${t.id}`} className="block">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {t.profiles?.avatar_url ? <img src={t.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>{t.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{t.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-medium">{t.profiles?.full_name || 'User'}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      <span className="bg-secondary px-2 py-0.5 rounded-full capitalize">{t.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={ref} className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

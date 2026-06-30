"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Calendar, MessageSquare, Loader2, Send } from 'lucide-react';
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

const MOCK_REPLIES = [
  { id: '1', content: 'Try using a ring light angled at 45 degrees!', created_at: new Date().toISOString(), profiles: { full_name: 'Vikram' } },
  { id: '2', content: 'Yes, side lighting helps highlight the weave structure much better than direct top lighting.', created_at: new Date().toISOString(), profiles: { full_name: 'Pooja' } }
];

async function fetchTopic(id: string) {
  const topic = MOCK_TOPICS.find(t => t.id === id);
  if (!topic) throw new Error('Topic not found');
  return topic;
}

async function fetchReplies(id: string) {
  return MOCK_REPLIES;
}

async function createReply(token: string, topicId: string, content: string) {
  const res = await fetch(`http://localhost:8000/api/forums/${topicId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to post reply');
  return res.json();
}

export default function ForumTopic() {
  const params = useParams();
  const topicId = params.id as string;
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tData, rData] = await Promise.all([fetchTopic(topicId), fetchReplies(topicId)]);
        setTopic(tData);
        setReplies(rData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [topicId]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';
      const newReply = await createReply(token, topicId, replyContent);
      // add optimistic profile since the api returns raw insert
      const optimisticReply = { ...newReply, profiles: { full_name: 'You' } };
      setReplies([...replies, optimisticReply]);
      setReplyContent('');
      toast({ title: 'Reply posted!' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!topic) return <div className="text-center py-20">Topic not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Link>

      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>{topic.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2"><User className="w-4 h-4" /> {topic.profiles?.full_name || 'User'}</div>
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(topic.created_at).toLocaleDateString()}</div>
          <span className="bg-secondary px-2.5 py-0.5 rounded-full capitalize text-xs">{topic.category}</span>
        </div>
        <div className="whitespace-pre-wrap text-foreground/90">{topic.content}</div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <MessageSquare className="w-5 h-5 text-primary" /> {replies.length} Replies
        </h3>
        
        {replies.map((reply, i) => (
          <div key={reply.id || i} className="bg-card/50 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="font-semibold text-foreground">{reply.profiles?.full_name || 'User'}</span>
              <span>{new Date(reply.created_at).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap text-sm text-foreground/90 pl-11">{reply.content}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 mt-6">
        <div className="flex gap-3">
          <Input 
            placeholder="Write a reply..." 
            value={replyContent} 
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            className="bg-background"
          />
          <Button onClick={handleReply} disabled={sending || !replyContent.trim()} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

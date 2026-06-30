"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { supabase } from '@/lib/supabaseClient';

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, profiles!inner(full_name)')
          .eq('slug', slug)
          .eq('published', true)
          .single();
          
        if (error) throw error;
        setBlog(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center pt-32 pb-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 pt-32 pb-16 text-center w-full">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <Link href="/blog" className="text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        
        {blog.thumbnail_url && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-8 shadow-md">
            <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          {blog.title}
        </h1>

        <div className="flex items-center gap-6 text-muted-foreground mb-10 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="font-medium text-foreground">{blog.profiles?.full_name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(blog.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary">
          <div dangerouslySetInnerHTML={{ 
            __html: `<p class="mb-4 leading-relaxed">${
              blog.content
                .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-5">$1</h2>')
                .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-6">$1</h1>')
                .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
                .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
            }</p>`
          }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

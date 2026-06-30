"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { supabase } from '@/lib/supabaseClient';

async function fetchBlogs(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content, thumbnail_url, created_at, profiles!inner(full_name)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
  return data || [];
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const loadBlogs = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const data = await fetchBlogs(10, (pageNum - 1) * 10);
      if (pageNum === 1) {
        setBlogs(data);
      } else {
        setBlogs(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs(1);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => {
        const next = prev + 1;
        loadBlogs(next);
        return next;
      });
    }
  }, [inView, hasMore, loading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full">
        <div className="mb-12 flex flex-col items-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-teal-500/10 border border-primary/20 flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-center" style={{ fontFamily: 'var(--font-display)' }}>
            ThreadCounty <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Latest news, textile insights, and updates from the ThreadCounty team.
          </p>
          <Link href="/blog/write">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              Write a Blog
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {loading && blogs.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-3xl border border-border">
            <h3 className="text-xl font-bold mb-2">No blogs yet</h3>
            <p className="text-muted-foreground">Check back later for exciting textile updates!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blog/${blog.slug}`} className="group h-full flex flex-col bg-card rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300">
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    {blog.thumbnail_url ? (
                      <Image 
                        src={blog.thumbnail_url} 
                        alt={blog.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-teal-500/20" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                      {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {blog.profiles?.full_name || 'Admin'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        {hasMore && (
          <div ref={ref} className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

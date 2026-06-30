"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WriteBlogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '')             // Trim - from end of text
      + '-' + Math.random().toString(36).substring(2, 6); // Add random hash to avoid collisions
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim() || !file) {
      toast({ title: 'Missing fields', description: 'Please provide a title, content, and thumbnail image.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      // 2. Insert into blog_posts (published: false by default)
      const slug = generateSlug(title);

      const { error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          author_id: user.id,
          title,
          slug,
          content,
          thumbnail_url: publicUrl,
          published: false
        });

      if (insertError) throw insertError;

      setSuccess(true);
      toast({ title: 'Success!', description: 'Your blog has been submitted and is pending admin approval.' });

    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error.message || 'Failed to submit blog.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Blog Submitted!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Thank you for contributing. Your post is now pending approval by an administrator. Once approved, it will be visible on the public blogs page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => { setSuccess(false); setTitle(''); setContent(''); setFile(null); setPreview(null); }}>Write Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Write a Blog</h1>
      <p className="text-muted-foreground mb-8">Share your textile knowledge with the community. Posts are reviewed by admins before publishing.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Thumbnail Image <span className="text-destructive">*</span></label>
          <div 
            className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-card relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer min-h-[240px]"
            onClick={() => document.getElementById('thumbnail')?.click()}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImagePlus className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-medium">Change Image</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImagePlus className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-1">Click to upload thumbnail</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
            <input id="thumbnail" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold">Title <span className="text-destructive">*</span></label>
          <Input 
            id="title"
            placeholder="E.g., The Future of Sustainable Denim"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg py-6"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-semibold">Content (Markdown supported) <span className="text-destructive">*</span></label>
          <Textarea 
            id="content"
            placeholder="Write your article content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] text-base resize-y"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="button" variant="ghost" className="mr-2" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Review'}
          </Button>
        </div>
      </form>
    </div>
  );
}

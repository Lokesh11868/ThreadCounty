"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadApi, reportApi } from '@/lib/apiClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';

import { Upload, Image, X, CheckCircle, AlertCircle, Loader2, FileImage, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Mock AI analysis since the legacy InvokeLLM was removed
const mockAnalyzeFabric = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const types = ['Cotton', 'Polyester', 'Silk', 'Linen', 'Wool', 'Denim'];
  const weaves = ['Plain Weave', 'Twill Weave', 'Satin Weave'];
  const grades = ['A+', 'A', 'B+', 'B', 'C'];
  
  const thread_density = Math.floor(Math.random() * (120 - 40 + 1)) + 40;
  
  return {
    thread_density,
    warp_count: Math.floor(thread_density * 0.55),
    weft_count: Math.floor(thread_density * 0.45),
    fabric_type: types[Math.floor(Math.random() * types.length)],
    weave_pattern: weaves[Math.floor(Math.random() * weaves.length)],
    confidence_score: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
    quality_grade: grades[Math.floor(Math.random() * grades.length)],
    ai_suggestions: "Consider increasing warp tension during weaving to improve dimensional stability. The current thread count indicates good durability for general apparel use.",
    detailed_analysis: "Microscopic analysis reveals a consistent yarn twist with minimal surface hairiness. The interlacing pattern is uniform, though slight variations in weft pick spacing are detectable under high magnification."
  };
};

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type) || file.size < 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1200;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`[Compression] Reduced size from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        } else {
          resolve(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function UploadFabric() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Only JPG, PNG, and WebP files are allowed.');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File size must be under 10MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback((f) => {
    if (!validateFile(f)) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(5);
    setError('');

    try {
      // Compress image client-side if it's large
      setProgress(15);
      const fileToUpload = await compressImage(file);

      // 1. Upload to Supabase Storage + create Upload record
      setProgress(35);
      const upload = await uploadApi.createUpload(fileToUpload);
      setProgress(65);

      // 2. Create Report (this triggers the simulated AI analysis on Python backend and updates status)
      const report = await reportApi.createReport(upload.id, language);
      setProgress(100);

      toast({ title: 'Analysis Complete!', description: 'Your fabric has been analyzed successfully.' });
      window.dispatchEvent(new Event('history-updated'));
      setTimeout(() => router.push(`/report/${report.id}`), 500);

    } catch (e) {
      console.error(e);
      setError(e.message || 'Upload failed. Please try again.');
      toast({ title: 'Error', description: e.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setProgress(0);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Upload Fabric</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8 pl-13">
          Upload a high-quality image of your fabric sample for AI-powered thread analysis.
        </p>

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 ${
                dragging
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.01]'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${dragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {dragging ? 'Drop to upload' : 'Drag & drop image'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">or click to browse your files</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {['JPG', 'PNG', 'WEBP', 'Max 10MB'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl"
            >
              {/* Preview image */}
              <div className="relative aspect-video bg-black/5 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img src={preview} alt="Fabric preview" className="w-full h-full object-cover" />
                {!uploading && (
                  <button onClick={clearFile} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* File info and Action */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileImage className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate mb-0.5">{file?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file?.size / 1024 / 1024).toFixed(2)} MB · {file?.type?.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>
                  {!uploading && (
                    <div className="w-8 h-8 rounded-full bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                    </div>
                  )}
                </div>

                {/* Progress */}
                {uploading && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium mb-3">
                      <span className="text-primary flex items-center gap-2">
                        {progress < 60 ? <><Upload className="w-4 h-4 animate-bounce" /> Uploading...</> 
                        : progress < 95 ? <><Sparkles className="w-4 h-4 animate-pulse" /> AI Analysis in progress...</> 
                        : <><CheckCircle className="w-4 h-4" /> Finalizing report...</>}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 rounded-full" />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-xl text-sm mb-6">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  size="lg"
                  className="w-full rounded-xl h-12 text-base gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-xl"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Start AI Analysis</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !preview && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-xl text-sm mt-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-card rounded-3xl border border-border p-6 sm:p-8">
          <h3 className="font-bold text-base mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <CheckCircle className="w-4 h-4 text-primary" /> Tips for Best Results
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Use a flat, well-lit surface',
              'Capture at close range for thread detail',
              'Avoid shadows and reflections',
              'Ensure the fabric is not wrinkled',
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
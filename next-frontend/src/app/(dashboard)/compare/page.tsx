"use client";

import React, { useState, useEffect } from 'react';
import { reportApi } from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, GitCompare, ArrowRight, ArrowLeft, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ComparePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReport1, setSelectedReport1] = useState<string>('');
  const [selectedReport2, setSelectedReport2] = useState<string>('');
  
  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await reportApi.listReports({ limit: 50 });
        setReports(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const report1 = reports.find(r => r.id === selectedReport1);
  const report2 = reports.find(r => r.id === selectedReport2);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <GitCompare className="w-8 h-8 text-primary" /> Fabric Comparison
        </h1>
        <p className="text-muted-foreground">Select two reports to compare their thread density and AI metrics side-by-side.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Selector 1 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample A</label>
          <Select value={selectedReport1} onValueChange={setSelectedReport1}>
            <SelectTrigger className="w-full bg-card h-12 rounded-xl border-border focus:ring-primary shadow-sm">
              <SelectValue placeholder="Select a report..." />
            </SelectTrigger>
            <SelectContent>
              {reports.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.uploads?.file_name || 'Fabric Report'} - {new Date(r.created_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {report1 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border border-border shadow-md overflow-hidden rounded-2xl">
                {report1.uploads?.thumbnail_url && (
                  <div className="h-48 w-full bg-muted/50 relative overflow-hidden">
                    <img src={report1.uploads.thumbnail_url} alt="thumbnail" className="object-cover w-full h-full" />
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{report1.fabric_type || 'Unknown Type'}</h3>
                    <p className="text-sm text-muted-foreground">Grade: {report1.quality_grade || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Density (EPI/PPI)</p>
                      <p className="text-lg font-semibold">{report1.thread_density}</p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Weave</p>
                      <p className="text-lg font-semibold">{report1.weave_pattern}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">AI Score</p>
                    <p className="text-lg font-semibold">{report1.confidence_score}%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-64 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground">
              Select Sample A
            </div>
          )}
        </div>

        {/* Selector 2 */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample B</label>
          <Select value={selectedReport2} onValueChange={setSelectedReport2}>
            <SelectTrigger className="w-full bg-card h-12 rounded-xl border-border focus:ring-primary shadow-sm">
              <SelectValue placeholder="Select a report..." />
            </SelectTrigger>
            <SelectContent>
              {reports.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.uploads?.file_name || 'Fabric Report'} - {new Date(r.created_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {report2 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border border-border shadow-md overflow-hidden rounded-2xl">
                {report2.uploads?.thumbnail_url && (
                  <div className="h-48 w-full bg-muted/50 relative overflow-hidden">
                    <img src={report2.uploads.thumbnail_url} alt="thumbnail" className="object-cover w-full h-full" />
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{report2.fabric_type || 'Unknown Type'}</h3>
                    <p className="text-sm text-muted-foreground">Grade: {report2.quality_grade || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Density (EPI/PPI)</p>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        {report2.thread_density}
                        {report1 && report2.thread_density > report1.thread_density && <ArrowRight className="w-4 h-4 text-green-500" />}
                        {report1 && report2.thread_density < report1.thread_density && <ArrowLeft className="w-4 h-4 text-red-500" />}
                      </p>
                    </div>
                    <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Weave</p>
                      <p className="text-lg font-semibold">{report2.weave_pattern}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">AI Score</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      {report2.confidence_score}%
                      {report1 && report2.confidence_score > report1.confidence_score && <ArrowRight className="w-4 h-4 text-green-500" />}
                      {report1 && report2.confidence_score < report1.confidence_score && <ArrowLeft className="w-4 h-4 text-red-500" />}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-64 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground">
              Select Sample B
            </div>
          )}
        </div>
      </div>


      {/* Detailed Analysis Section */}
      {(report1?.detailed_analysis || report2?.detailed_analysis) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Cpu className="w-5 h-5 text-primary" /> Fabric Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
            {report1 ? (
              <Card className="bg-card border border-border shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Sample A Analysis</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                    <p className="leading-relaxed">{report1.detailed_analysis || 'No detailed analysis available.'}</p>
                  </div>
                </CardContent>
              </Card>
            ) : <div />}
            
            {report2 ? (
              <Card className="bg-card border border-border shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Sample B Analysis</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                    <p className="leading-relaxed">{report2.detailed_analysis || 'No detailed analysis available.'}</p>
                  </div>
                </CardContent>
              </Card>
            ) : <div />}
          </div>

          {/* Analytics Graphs */}
          {report1 && report2 && (
            <div className="grid md:grid-cols-2 gap-8 items-start mt-8">
              <Card className="bg-card border border-border shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-6 text-sm text-muted-foreground uppercase tracking-wider text-center">Metric Comparison</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Density (EPI/PPI)', SampleA: report1.thread_density, SampleB: report2.thread_density },
                          { name: 'AI Score (%)', SampleA: report1.confidence_score, SampleB: report2.confidence_score }
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'var(--color-secondary)' }} contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="SampleA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="SampleB" fill="hsl(165 67% 46%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-6 text-sm text-muted-foreground uppercase tracking-wider text-center">Quality Radar</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                        { metric: 'Density', A: report1.thread_density, B: report2.thread_density, fullMark: Math.max(report1.thread_density, report2.thread_density) * 1.2 },
                        { metric: 'Confidence', A: report1.confidence_score, B: report2.confidence_score, fullMark: 100 },
                        { metric: 'Warp', A: report1.warp_count || report1.thread_density/2, B: report2.warp_count || report2.thread_density/2, fullMark: Math.max(report1.warp_count || report1.thread_density/2, report2.warp_count || report2.thread_density/2) * 1.2 },
                        { metric: 'Weft', A: report1.weft_count || report1.thread_density/2, B: report2.weft_count || report2.thread_density/2, fullMark: Math.max(report1.weft_count || report1.thread_density/2, report2.weft_count || report2.thread_density/2) * 1.2 },
                      ]}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="metric" fontSize={12} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                        <Radar name="Sample A" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                        <Radar name="Sample B" dataKey="B" stroke="hsl(165 67% 46%)" fill="hsl(165 67% 46%)" fillOpacity={0.4} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

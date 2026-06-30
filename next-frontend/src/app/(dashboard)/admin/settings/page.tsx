"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Globe, Palette, UploadCloud, BrainCircuit, AlertTriangle, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    platformName: "ThreadCounty",
    supportEmail: "support@threadcounty.com",
    defaultLanguage: "en",
    maxUploadSizeMB: 10,
    dailyFreeUploads: 5,
    enableAI: true,
    aiConfidenceThreshold: 60,
    maintenanceMode: false,
    maintenanceMessage: "We are currently down for maintenance. Please check back later."
  });

  useEffect(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('tc_admin_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save to localStorage for now (until backend is ready)
    localStorage.setItem('tc_admin_settings', JSON.stringify(settings));
    
    setIsSaving(false);
    toast({ title: "Settings saved successfully", description: "Your platform configurations have been updated." });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application behavior and features.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-md shadow-primary/20">
          <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-bounce' : ''}`} />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Globe className="w-5 h-5 text-blue-500" /> General Settings
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Name</label>
              <Input 
                value={settings.platformName} 
                onChange={(e) => handleChange('platformName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input 
                type="email"
                value={settings.supportEmail} 
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Upload Settings */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <UploadCloud className="w-5 h-5 text-teal-500" /> Upload Configuration
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Upload Size (MB)</label>
              <Input 
                type="number" min={1} max={50}
                value={settings.maxUploadSizeMB} 
                onChange={(e) => handleChange('maxUploadSizeMB', parseInt(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">Maximum size for a single fabric image upload.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Free Upload Limit</label>
              <Input 
                type="number" min={0}
                value={settings.dailyFreeUploads} 
                onChange={(e) => handleChange('dailyFreeUploads', parseInt(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">Number of uploads allowed per day for free tier users.</p>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <BrainCircuit className="w-5 h-5 text-violet-500" /> AI Engine Configuration
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable AI Processing</label>
                <p className="text-xs text-muted-foreground">Allow users to generate new AI reports.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.enableAI} onChange={(e) => handleChange('enableAI', e.target.checked)} />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Confidence Threshold</label>
                <span className="text-sm font-bold text-primary">{settings.aiConfidenceThreshold}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={settings.aiConfidenceThreshold}
                onChange={(e) => handleChange('aiConfidenceThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">Results below this threshold will be flagged for manual review.</p>
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6 border-t-4 border-t-amber-500">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Maintenance Mode
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div>
                <label className="text-sm font-semibold text-amber-600 dark:text-amber-400">Enable Maintenance Mode</label>
                <p className="text-xs text-muted-foreground mt-1">Platform will be inaccessible to non-admins.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            <div className={`space-y-2 transition-opacity ${settings.maintenanceMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="text-sm font-medium">Maintenance Message</label>
              <textarea 
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                rows={3}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

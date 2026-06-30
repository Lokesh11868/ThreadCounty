"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, Users, Upload, FileText,
  CreditCard, MessageSquare, BarChart3, Bell, Settings,
  ClipboardList, ChevronLeft, ArrowLeft, X, Menu, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const adminNavItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Uploads', icon: Upload, href: '/admin/uploads' },
  { label: 'AI Reports', icon: FileText, href: '/admin/reports' },
  { label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
  { label: 'Blogs', icon: BookOpen, href: '/admin/blogs' },
  { label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
  { label: 'Audit Logs', icon: ClipboardList, href: '/admin/audit-logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isLoadingAuth && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth) return null;
  if (user && user.role !== 'admin') return null;

  const currentPage = adminNavItems.find(i =>
    i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href)
  )?.label || 'Admin';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 p-5 border-b border-border/50 ${collapsed && !isMobile ? 'justify-center px-3' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-amber-500" />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <p className="font-bold text-sm whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</p>
              <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">ThreadCounty</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 pt-3">
        <Link href="/dashboard">
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Back to App</motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
        {adminNavItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}
                ${collapsed && !isMobile ? 'justify-center' : ''}
              `}>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : ''}`} />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/50">
        <div className={`flex items-center gap-2.5 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-semibold truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-amber-500 font-medium uppercase tracking-wider">Administrator</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-card border-r border-border z-40 overflow-hidden"
      >
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute top-[26px] -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:border-amber-500/50 transition-colors z-10">
          <ChevronLeft className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} className="lg:hidden fixed top-0 left-0 bottom-0 w-60 bg-card border-r border-border z-50 shadow-2xl">
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.main animate={{ marginLeft: collapsed ? 72 : 240 }} transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }} className="flex-1 hidden lg:block">
        <div className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold">{currentPage}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">Admin Mode</span>
          </div>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </motion.main>

      <div className="lg:hidden flex-1 pt-14">
        <div className="p-4 pt-6">{children}</div>
      </div>
    </div>
  );
}


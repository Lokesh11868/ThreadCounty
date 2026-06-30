"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, History, User, LogOut,
  Menu, X, ChevronLeft, Shield, Zap, Bell, Check, Info, CheckCircle2, AlertTriangle, XCircle,
  MessageSquare, BarChart2, GitCompare, Users, Home, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { notificationApi } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import FloatingChatbot from '@/components/FloatingChatbot';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  i18n?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', i18n: 'dashboard' },
  { label: 'Upload', icon: Upload, href: '/upload', i18n: 'upload' },
  { label: 'History', icon: History, href: '/history', i18n: 'history' },
  { label: 'AI Chatbot', icon: MessageSquare, href: '/chatbot', i18n: 'chatbot' },
  { label: 'Analytics', icon: BarChart2, href: '/analytics', i18n: 'analytics' },
  { label: 'Compare', icon: GitCompare, href: '/compare', i18n: 'compare' },
  { label: 'Community', icon: Users, href: '/community', i18n: 'Community' },
  { label: 'Write Blog', icon: BookOpen, href: '/blog/write', i18n: 'Write Blog' },
  { label: 'Profile', icon: User, href: '/profile', i18n: 'Profile' },
];

const adminItems: NavItem[] = [
  { label: 'Admin Panel', icon: Shield, href: '/admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  useEffect(() => setMobileOpen(false), [pathname]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const loadNotifications = async () => {
    try {
      const n = await notificationApi.listNotifications();
      setNotifications(n || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('history-updated', loadNotifications);
    
    // Set up Realtime subscription
    let channel;
    if (user?.id) {
      channel = supabase
        .channel('realtime_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
            // Optional: Play a sound or trigger a toast here for real-time alert
          }
        )
        .subscribe();
    }
    
    return () => {
      window.removeEventListener('history-updated', loadNotifications);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await notificationApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      await notificationApi.dismissNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const typeConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    success: { icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const NotificationPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative hover:bg-secondary rounded-full">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden bg-card border border-border shadow-lg rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
          <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full text-primary hover:text-primary/80 px-2.5 font-semibold" onClick={markAllRead}>
              <Check className="w-3 h-3 mr-1" /> Mark read
            </Button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
          {loadingNotifications ? (
            <p className="text-xs text-muted-foreground text-center py-6">Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = typeConfig[n.type as keyof typeof typeConfig] || typeConfig.info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 text-xs transition-colors hover:bg-secondary/20 ${n.is_read ? 'opacity-70' : 'bg-secondary/10'}`}
                >
                  <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground leading-tight">{n.title}</p>
                    <p className="text-muted-foreground mt-0.5 leading-normal">{n.message}</p>
                    {n.link && (
                      <Link href={n.link} className="inline-block text-[10px] text-primary hover:underline mt-1 font-medium">
                        View details
                      </Link>
                    )}
                  </div>
                  <button onClick={() => dismissNotification(n.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  const allItems = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-border/50 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md border border-border flex items-center justify-center bg-card">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 opacity-20 blur-sm" />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-base whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                Thread<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 drop-shadow-sm">County</span>
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap className="w-2.5 h-2.5 text-teal-500" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">AI Analysis</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Back to Home */}
        <Link href="/">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground mb-2 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
            <Home className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>Back to Home</span>}
          </div>
        </Link>
        <div className="h-px bg-border/50 mb-2" />
        {allItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                  ${collapsed && !isMobile ? 'justify-center' : ''}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.i18n ? t(item.i18n as any) : item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isActive && !collapsed && (
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade badge */}
      <AnimatePresence>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mb-3"
          >
            <Link href="/pricing">
              <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-br from-violet-500/10 to-teal-500/10 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Upgrade Pro</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Get unlimited analyses & PDF exports</p>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User footer */}
      <div className="p-3 border-t border-border/50">
        <div className={`flex items-center gap-2.5 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-teal-400 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => logout(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-card border-r border-border z-40 overflow-hidden"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[26px] -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:border-primary/50 transition-colors z-10"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 glass border-b border-border z-50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md border border-border flex items-center justify-center bg-card">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
            Thread<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 drop-shadow-sm">County</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationPopover />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(!mobileOpen)}>
            <AnimatePresence mode="wait">
              {mobileOpen
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-4 h-4" /></motion.span>
                : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-4 h-4" /></motion.span>
              }
            </AnimatePresence>
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50 shadow-2xl"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
        className="flex-1 hidden lg:block"
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-14 glass border-b border-border flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {allItems.find(i => i.href === pathname)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationPopover />
          </div>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </motion.main>

      {/* Mobile main content */}
      <div className="lg:hidden flex-1 pt-14">
        <div className="p-4 pt-6">
          {children}
        </div>
      </div>

      <FloatingChatbot />
    </div>
  );
}
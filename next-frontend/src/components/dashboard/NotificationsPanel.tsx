"use client";



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

import { notificationApi } from '@/lib/apiClient';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const n = await notificationApi.listNotifications();
      setNotifications(n || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await notificationApi.markAllNotificationsRead();
    } catch (e) {
      console.error(e);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const dismiss = async (id) => {
    try {
      await notificationApi.dismissNotification(id);
    } catch (e) {
      console.error(e);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border/30 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center relative">
              <Bell className="w-4.5 h-4.5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="font-display font-semibold text-sm">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 rounded-full" onClick={markAllRead}>
              <Check className="w-3 h-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl ${n.is_read ? 'bg-[#FAFAFC]' : cfg.bg}`}
                >
                  <cfg.icon className={`w-4 h-4 ${cfg.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
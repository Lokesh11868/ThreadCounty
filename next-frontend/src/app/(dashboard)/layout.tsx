"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter, usePathname } from 'next/navigation';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import PageLoader from '@/components/layout/PageLoader';

export default function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  useEffect(() => {
    if (authChecked && !isLoadingAuth) {
      if (authError && authError.type !== 'user_not_registered') {
        router.push('/login');
      } else if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [authChecked, isLoadingAuth, authError, isAuthenticated, router]);

  if (isLoadingAuth || !authChecked) {
    return <PageLoader fullScreen />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

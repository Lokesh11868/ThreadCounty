import { supabase } from './supabaseClient';

async function getHeaders(isMultipart = false) {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

class AppError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

async function request(url: string, options: RequestInit = {}, isMultipart = false) {
  const headers = await getHeaders(isMultipart);
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    cache: 'no-store',
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      
      if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
      
      throw new AppError(errData.detail || 'Request failed', res.status.toString(), errData);
    }
    return await res.json();
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Network error', 'NETWORK_ERROR');
  }
}

// ─────────────────────────────────────────────
// API Exports
// ─────────────────────────────────────────────

export const authApi = {
  getMe: async () => {
    return request('/api/users/me');
  },
  signUp: async (email: string, password: string, fullName: string) => {
    // Auth actions can still be handled directly by Supabase on the client-side
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
    return data;
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
    return data;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
  },
  updatePassword: async (currentPassword: string, newPassword: string, confirmPassword?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new AppError('User not logged in', 'AUTH_ERROR');
    
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      throw new AppError('Current password is incorrect.', 'UNAUTHORIZED');
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
  },
  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
  },
  resetPassword: async (password: string, confirmPassword?: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
  },
  signInWithOAuth: async (provider: 'google' | 'github' = 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw new AppError(error.message, 'AUTH_ERROR');
  },
};

export const userApi = {
  getProfile: async () => {
    return request('/api/users/me');
  },
  updateProfile: async (updates: any) => {
    return request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/users/avatar', {
      method: 'POST',
      body: formData,
    }, true);
  },
  deleteAccount: async () => {
    return request('/api/users/me', {
      method: 'DELETE',
    });
  },
};

export const uploadApi = {
  checkUploadLimit: async () => {
    return request('/api/uploads/quota');
  },
  createUpload: async (file: File, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    return request('/api/uploads', {
      method: 'POST',
      body: formData,
    }, true);
  },
  getUpload: async (id: string) => {
    return request(`/api/uploads/${id}`);
  },
  listUploads: async (filters: { status?: string; limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    return request(`/api/uploads?${params.toString()}`);
  },
  updateUploadStatus: async (id: string, status: string) => {
    return request(`/api/uploads/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  deleteUpload: async (id: string) => {
    return request(`/api/uploads/${id}`, {
      method: 'DELETE',
    });
  },
};

export const reportApi = {
  createReport: async (uploadId: string, language: string = 'en') => {
    const formData = new FormData();
    formData.append('upload_id', uploadId);
    formData.append('language', language);
    return request('/api/reports', {
      method: 'POST',
      body: formData,
    }, true);
  },
  getReport: async (id: string) => {
    return request(`/api/reports/${id}`);
  },
  listReports: async (filters: { fabric_type?: string; quality_grade?: string; limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.fabric_type) params.append('fabric_type', filters.fabric_type);
    if (filters.quality_grade) params.append('quality_grade', filters.quality_grade);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    return request(`/api/reports?${params.toString()}`);
  },
  deleteReport: async (id: string) => {
    return request(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },
  exportReport: async (id: string) => {
    return request(`/api/reports/${id}/export`);
  },
};

export const dashboardApi = {
  getDashboardStats: async () => {
    return request('/api/dashboard/stats');
  },
  getRecentReports: async (limit = 5) => {
    return request(`/api/dashboard/recent?limit=${limit}`);
  },
  getStorageUsage: async () => {
    return request('/api/dashboard/storage');
  },
  getActivityTimeline: async (days = 30) => {
    return request(`/api/dashboard/timeline?days=${days}`);
  },
  getGradeDistribution: async () => {
    return request('/api/dashboard/grades');
  },
  getFabricTypeDistribution: async () => {
    return request('/api/dashboard/fabrics');
  },
};

export const adminApi = {
  getPlatformStats: async () => {
    return request('/api/admin/stats');
  },
  getAllUsers: async (filters: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    return request(`/api/admin/users?${params.toString()}`);
  },
  getUserById: async (id: string) => {
    return request(`/api/admin/users/${id}`);
  },
  updateUserRole: async (id: string, role: 'admin' | 'user') => {
    return request(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
  setBanStatus: async (id: string, isBanned: boolean) => {
    return request(`/api/admin/users/${id}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ is_banned: isBanned }),
    });
  },
  getAllUploads: async (filters: { page?: number; limit?: number; status?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    return request(`/api/admin/uploads?${params.toString()}`);
  },
  getAllReports: async (filters: { page?: number; limit?: number; quality_grade?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.quality_grade) params.append('quality_grade', filters.quality_grade);
    return request(`/api/admin/reports?${params.toString()}`);
  },
  getAllContactMessages: async (filters: { page?: number; limit?: number; status?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    return request(`/api/admin/contact?${params.toString()}`);
  },
  updateContactMessageStatus: async (id: string, status: string) => {
    return request(`/api/admin/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  broadcastNotification: async (title: string, message: string, type = 'info', link?: string) => {
    return request('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, type, link }),
    });
  },
  deleteReport: async (id: string) => {
    return request(`/api/admin/reports/${id}`, {
      method: 'DELETE',
    });
  },
  deleteUpload: async (id: string) => {
    return request(`/api/admin/uploads/${id}`, {
      method: 'DELETE',
    });
  },
  updateUserSubscription: async (userId: string, data: { plan: string; uploads_limit: number; status: string }) => {
    return request(`/api/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteUser: async (id: string) => {
    return request(`/api/admin/users/${id}`, { method: 'DELETE' });
  },
  getRecentActivity: async (limit = 20) => {
    return request(`/api/admin/activity?limit=${limit}`);
  },
  reprocessUpload: async (id: string) => {
    return request(`/api/admin/uploads/${id}/reprocess`, { method: 'POST' });
  },
  reprocessReport: async (id: string) => {
    return request(`/api/admin/reports/${id}/reprocess`, { method: 'POST' });
  },
  broadcastToAudience: async (data: { title: string; message: string; type: string; audience: string; link?: string }) => {
    return request('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const contactApi = {
  sendContactMessage: async (data: { name: string; email: string; subject?: string; message: string }) => {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  deleteContactMessage: async (id: string) => {
    return request(`/api/admin/contact/${id}`, {
      method: 'DELETE',
    });
  },
};

export const notificationApi = {
  listNotifications: async () => {
    return request('/api/notifications');
  },
  markNotificationRead: async (id: string) => {
    return request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
  dismissNotification: async (id: string) => {
    return request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },
  markAllNotificationsRead: async () => {
    return request('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};

export const chatbotApi = {
  sendMessage: async (messages: { role: string; content: string }[]) => {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

// Decode JWT payload without verification (for expiry check only)
function decodeToken(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

// Check if token is expired (with 1 minute buffer)
function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const bufferTime = 60 * 1000; // 1 minute buffer
  return Date.now() > expiryTime - bufferTime;
}

// Clear auth data and redirect to login
function handleExpiredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    if (isTokenExpired(token)) {
      handleExpiredToken();
      throw new Error('Session expired. Please log in again.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined' && !skipAuth) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        handleExpiredToken();
        throw new Error('Session expired. Please log in again.');
      }
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: any; needsVerification?: boolean; email?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    fetchApi<{ message: string; token?: string; user?: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  forgotPassword: (email: string) =>
    fetchApi<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, token: string, password: string) =>
    fetchApi<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password }),
    }),
  me: () => fetchApi<any>('/api/auth/me'),
  updateProfile: (data: { name?: string; email?: string; role?: string }) =>
    fetchApi<any>('/api/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// Books
export const books = {
  list: (params?: { search?: string; category?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    return fetchApi<any>(`/api/books?${searchParams}`);
  },
  get: (id: string) => fetchApi<any>(`/api/books/${id}`),
  categories: () => fetchApi<string[]>('/api/books/categories'),
  availableCopies: () => fetchApi<any[]>('/api/books/available-copies'),
  create: (data: any) =>
    fetchApi<any>('/api/books', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/api/books/${id}`, { method: 'DELETE' }),
  addCopy: (bookId: string, data: { barcode: string; condition?: string; shelfLocation?: string }) =>
    fetchApi<any>(`/api/books/${bookId}/copies`, { method: 'POST', body: JSON.stringify(data) }),
  updateCopy: (copyId: string, data: { barcode?: string; status?: string; condition?: string; shelfLocation?: string }) =>
    fetchApi<any>(`/api/books/copies/${copyId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Members
export const members = {
  list: (params?: { search?: string; status?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    return fetchApi<any>(`/api/members?${searchParams}`);
  },
  get: (id: string) => fetchApi<any>(`/api/members/${id}`),
  create: (data: any) =>
    fetchApi<any>('/api/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<any>(`/api/members/${id}`, { method: 'DELETE' }),
};

// Borrowings
export const borrowings = {
  list: (params?: { status?: string; memberId?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.memberId) searchParams.set('memberId', params.memberId);
    if (params?.page) searchParams.set('page', params.page.toString());
    return fetchApi<any>(`/api/borrowings?${searchParams}`);
  },
  get: (id: string) => fetchApi<any>(`/api/borrowings/${id}`),
  update: (id: string, data: { dueDate?: string; status?: string }) =>
    fetchApi<any>(`/api/borrowings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  checkout: (data: { memberId: string; barcode: string; dueDate?: string }) =>
    fetchApi<any>('/api/borrowings/checkout', { method: 'POST', body: JSON.stringify(data) }),
  return: (id: string, data?: { condition?: string }) =>
    fetchApi<any>(`/api/borrowings/${id}/return`, { method: 'POST', body: JSON.stringify(data || {}) }),
  delete: (id: string) => fetchApi<any>(`/api/borrowings/${id}`, { method: 'DELETE' }),
  overdue: () => fetchApi<any>('/api/borrowings/overdue/list'),
};

// Dashboard
export const dashboard = {
  stats: () => fetchApi<any>('/api/dashboard/stats'),
  seedDemo: () => fetchApi<{ message: string; summary: any }>('/api/dashboard/seed-demo', { method: 'POST' }),
};

// Fines
export const fines = {
  list: (params?: { status?: string; memberId?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.memberId) searchParams.set('memberId', params.memberId);
    if (params?.page) searchParams.set('page', params.page.toString());
    return fetchApi<any>(`/api/fines?${searchParams}`);
  },
  stats: () => fetchApi<any>('/api/fines/stats'),
  get: (id: string) => fetchApi<any>(`/api/fines/${id}`),
  calculate: () => fetchApi<any>('/api/fines/calculate', { method: 'POST' }),
  create: (data: { borrowingId: string; amount: number; reason: string }) =>
    fetchApi<any>('/api/fines', { method: 'POST', body: JSON.stringify(data) }),
  pay: (id: string) => fetchApi<any>(`/api/fines/${id}/pay`, { method: 'PUT' }),
  waive: (id: string) => fetchApi<any>(`/api/fines/${id}/waive`, { method: 'PUT' }),
  delete: (id: string) => fetchApi<any>(`/api/fines/${id}`, { method: 'DELETE' }),
};

// Reports
export const reports = {
  books: (format?: 'json' | 'csv') => {
    const url = `/api/reports/books${format === 'csv' ? '?format=csv' : ''}`;
    if (format === 'csv') {
      return fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(res => res.blob());
    }
    return fetchApi<any>(url);
  },
  members: (format?: 'json' | 'csv') => {
    const url = `/api/reports/members${format === 'csv' ? '?format=csv' : ''}`;
    if (format === 'csv') {
      return fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(res => res.blob());
    }
    return fetchApi<any>(url);
  },
  borrowings: (params?: { format?: 'json' | 'csv'; status?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.format) searchParams.set('format', params.format);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const url = `/api/reports/borrowings?${searchParams}`;
    if (params?.format === 'csv') {
      return fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(res => res.blob());
    }
    return fetchApi<any>(url);
  },
  fines: (params?: { format?: 'json' | 'csv'; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.format) searchParams.set('format', params.format);
    if (params?.status) searchParams.set('status', params.status);
    const url = `/api/reports/fines?${searchParams}`;
    if (params?.format === 'csv') {
      return fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(res => res.blob());
    }
    return fetchApi<any>(url);
  },
  overdue: (format?: 'json' | 'csv') => {
    const url = `/api/reports/overdue${format === 'csv' ? '?format=csv' : ''}`;
    if (format === 'csv') {
      return fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      }).then(res => res.blob());
    }
    return fetchApi<any>(url);
  },
  summary: () => fetchApi<any>('/api/reports/summary'),
  insights: () => fetchApi<any>('/api/reports/insights'),
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
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
    fetchApi<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => fetchApi<any>('/api/auth/me'),
  updateProfile: (data: { name?: string; email?: string }) =>
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
};

// API utility functions for authenticated requests

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Create headers with authorization
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Make authenticated API request
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.error) {
      throw new ApiError(data.error.code, data.error.message, data.error.details);
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// User API functions
export const userApi = {
  getProfile: () => apiRequest('/user/profile'),

  getSavedProperties: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiRequest(`/user/saved-properties${query ? `?${query}` : ''}`);
  },

  getActivity: (limit = 10) =>
    apiRequest(`/user/activity?limit=${limit}`),

  getDashboardStats: () =>
    apiRequest('/user/dashboard-stats'),

  getSavedSearches: () =>
    apiRequest('/saved-searches'),

  getViewings: () =>
    apiRequest('/user/viewings'),
};

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: any) =>
    fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),
};